var bole = require('bole');
var HAProxy = require('haproxy');
var NumbatEmitter = require('numbat-emitter');

var DEFAULT_INTERVAL = 1000;

var HAProxyProducer = module.exports = function(options) {
  var emitter = new NumbatEmitter(options);
  emitter.metric('monitor.start');
  setInterval(produce, options.interval || DEFAULT_INTERVAL);

  var logger = options.logger || bole('numbat-haproxy');

  var haproxy = new HAProxy(options.haproxy);

  function produce() {
    haproxy.stat('-1', '-1', '-1', function (err, info) {
      if (err) {
        logger.error('error while trying to retrieve HAProxy stats', err);
        return;
      }

      info.forEach(function (section) {
        if (section.pxname === 'stats') {
          return;
        }

        var service = ['haproxy', section.pxname, section.svname].join('.');

        if (section.qcur) {
          emitter.metric({
            name: service + '.queued-requests',
            value: parseInt(section.qcur, 10)
          });
        }

        if (section.bin) {
          emitter.metric({
            name: service + '.bytes-in',
            value: parseInt(section.bin, 10)
          });
        }

        if (section.bout) {
          emitter.metric({
            name: service + '.bytes-out',
            value: parseInt(section.bout, 10)
          });
        }

        if (section.rate) {
          emitter.metric({
            name: service + '.rate',
            value: parseInt(section.rate, 10)
          });
        }

        if (section.ereq) {
          emitter.metric({
            name: service + '.request-errors',
            value: parseInt(section.ereq, 10)
          });
        }

        if (section.econ) {
          emitter.metric({
            name: service + '.connection-errors',
            value: parseInt(section.econ, 10)
          });
        }

        if (section.eresp) {
          emitter.metric({
            name: service + '.response-errors',
            value: parseInt(section.eresp, 10)
          });
        }

        if (section.hrsp_1xx) {
          emitter.metric({
            name: service + '.http-1xx',
            value: parseInt(section.hrsp_1xx, 10)
          });
        }

        if (section.hrsp_2xx) {
          emitter.metric({
            name: service + '.http-2xx',
            value: parseInt(section.hrsp_2xx, 10)
          });
        }

        if (section.hrsp_3xx) {
          emitter.metric({
            name: service + '.http-3xx',
            value: parseInt(section.hrsp_3xx, 10)
          });
        }

        if (section.hrsp_4xx) {
          emitter.metric({
            name: service + '.http-4xx',
            value: parseInt(section.hrsp_4xx, 10)
          });
        }

        if (section.hrsp_5xx) {
          emitter.metric({
            name: service + '.http-5xx',
            value: parseInt(section.hrsp_5xx, 10)
          });
        }
      });
    });
  }
};
