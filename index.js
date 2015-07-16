var HAProxy = require('haproxy');
var NumbatEmitter = require('numbat-emitter');

var DEFAULT_INTERVAL = 1000;

var HAProxyProducer = module.exports = function(options) {
  var emitter = new NumbatEmitter(options);
  setInterval(produce, options.interval || DEFAULT_INTERVAL);

  var haproxy = new HAProxy(options.haproxy);

  function produce() {
    haproxy.stat('-1', '-1', '-1', function (err, info) {
      info.forEach(function (section) {
        if (section.pxname === 'stats') {
          return;
        }

        var service = ['haproxy', section.pxname, section.svname].join('.');

        if (section.qcur) {
          emitter.metric({
            name: service + '.queued-requests',
            description: 'Queued requests',
            metric: parseInt(section.qcur, 10)
          });
        }

        if (section.bin) {
          emitter.metric({
            name: service + '.bytes-in',
            description: 'Bytes in',
            metric: parseInt(section.bin, 10)
          });
        }

        if (section.bout) {
          emitter.metric({
            name: service + '.bytes-out',
            description: 'Bytes out',
            metric: parseInt(section.bout, 10)
          });
        }

        if (section.rate) {
          emitter.metric({
            name: service + '.rate',
            description: 'Request rate',
            metric: parseInt(section.rate, 10)
          });
        }

        if (section.ereq) {
          emitter.metric({
            name: service + '.request-errors',
            description: 'Request errors',
            metric: parseInt(section.ereq, 10)
          });
        }

        if (section.econ) {
          emitter.metric({
            name: service + '.connection-errors',
            description: 'Connection errors',
            metric: parseInt(section.econ, 10)
          });
        }

        if (section.eresp) {
          emitter.metric({
            name: service + '.response-errors',
            description: 'Response errors',
            metric: parseInt(section.eresp, 10)
          });
        }

        if (section.hrsp_1xx) {
          emitter.metric({
            name: service + '.http-1xx',
            description: '1xx HTTP responses',
            metric: parseInt(section.hrsp_1xx, 10)
          });
        }

        if (section.hrsp_2xx) {
          emitter.metric({
            name: service + '.http-2xx',
            description: '2xx HTTP responses',
            metric: parseInt(section.hrsp_2xx, 10)
          });
        }

        if (section.hrsp_3xx) {
          emitter.metric({
            name: service + '.http-3xx',
            description: '3xx HTTP responses',
            metric: parseInt(section.hrsp_3xx, 10)
          });
        }

        if (section.hrsp_4xx) {
          emitter.metric({
            name: service + '.http-4xx',
            description: '4xx HTTP responses',
            metric: parseInt(section.hrsp_4xx, 10)
          });
        }

        if (section.hrsp_5xx) {
          emitter.metric({
            name: service + '.http-5xx',
            description: '5xx HTTP responses',
            metric: parseInt(section.hrsp_5xx, 10)
          });
        }
      });
    });
  }
};
