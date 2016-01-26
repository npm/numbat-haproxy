var bole = require('bole');
var HAProxy = require('haproxy');
var NumbatEmitter = require('numbat-emitter');

var DEFAULT_INTERVAL = 1000;

var HAProxyProducer = module.exports = function(options) {
  var emitter = new NumbatEmitter(options);
  emitter.metric('haproxy.monitor.start');
  setInterval(produce, options.interval || DEFAULT_INTERVAL);

  var logger = options.logger || bole('numbat-haproxy');
  
  var haproxy;


  // HAProxy only gives us the total amount of requests in many cases (like
  // all the status code stats), so keep the previous bundle we get and do
  // deltas ourselves.
  var previous;

  function produce() {
    if(!haproxy) {
      try{
        haproxy = new HAProxy(options.haproxy);
      } catch(e){
        console.error('haproxy error: haproxy may not be installed on this server. ',e)
        return 
      }     
    }
    haproxy.stat('-1', '-1', '-1', function (err, info) {
      if (err) {
        logger.error('error while trying to retrieve HAProxy stats', err);
        return;
      }

      info.forEach(function (section) {
        function delta(stat) {
          var previousSection = previous.filter(function (previousSection) {
            return previousSection.pxname === section.pxname &&
                   previousSection.svname === section.svname;
          });

          return section[stat] - (previousSection[0] ? previousSection[0][stat] : 0);
        }

        if (section.pxname === 'stats') {
          return;
        }

        var service = 'haproxy';

        if (section.rate) {
          emitter.metric({
            name: service + '.rate',
            value: parseInt(section.rate, 10),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        // All further stats are totals.
        if (!previous) return;

        if (section.qcur) {
          emitter.metric({
            name: service + '.queued-requests',
            value: delta('qcur'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.bin) {
          emitter.metric({
            name: service + '.bytes-in',
            value: delta('bin'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.bout) {
          emitter.metric({
            name: service + '.bytes-out',
            value: delta('bout'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.ereq) {
          emitter.metric({
            name: service + '.request-errors',
            value: delta('ereq'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.econ) {
          emitter.metric({
            name: service + '.connection-errors',
            value: delta('econ'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.eresp) {
          emitter.metric({
            name: service + '.response-errors',
            value: delta('eresp'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.hrsp_1xx) {
          emitter.metric({
            name: service + '.http-1xx',
            value: delta('hrsp_1xx'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.hrsp_2xx) {
          emitter.metric({
            name: service + '.http-2xx',
            value: delta('hrsp_2xx'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.hrsp_3xx) {
          emitter.metric({
            name: service + '.http-3xx',
            value: delta('hrsp_3xx'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.hrsp_4xx) {
          emitter.metric({
            name: service + '.http-4xx',
            value: delta('hrsp_4xx'),
            pxname: section.pxname,
            svname: section.svname
          });
        }

        if (section.hrsp_5xx) {
          emitter.metric({
            name: service + '.http-5xx',
            value: delta('hrsp_5xx'),
            pxname: section.pxname,
            svname: section.svname
          });
        }
      });

      previous = info;
    });
  }
};
