/**
 * Main application file for: <%= projectName %>
 *
 * This pulls in all the parts
 * and creates the main object for the application.
 */

// Create main application
define('<%= projectName %>', [
  <% for (var c in filteredComponentMap) { if (filteredComponentMap[c].js && filteredComponentMap[c].returns) { %>'<%= filteredComponentMap[c].rname %>', <% }} %>
  'helpers',
  <%= (projectFeatures.hasCSVs === true) ? "'text!../data/example.csv', " : "" %>
  'text!templates/application.<%= templateExt %>',
  'text!templates/loading.<%= templateExt %>'
], function(
  <% for (var c in filteredComponentMap) { if (filteredComponentMap[c].js && filteredComponentMap[c].returns) { %><%= filteredComponentMap[c].returns %>, <% }} %>
  helpers,
  <%= (projectFeatures.hasCSVs === true) ? "tExampleCSV, " : "" %>
  tApplication, tLoading
  ) {

  // Constructor for app
  var App = function(options) {
    this.options = _.extend(this.defaultOptions, options);
    this.el = this.options.el;
    this.$el = $(this.el);
    this.$ = function(selector) { return this.$el.find(selector); };
    this.$content = this.$el.find('.content-container');
    this.loadApp();
  };

  // Extend with custom methods
  _.extend(App.prototype, {
    // Start function
    start: function() {
      var thisApp = this;

      <% if (projectFeatures['hasBackbone'] === true) { %>
      // Override backbone's ajax request for use with JSONP
      // which is not preferred but we have to support
      // older browsers
      Backbone.ajax = helpers.BackboneAJAX;

      // Create router
      this.router = new routers.Router({
        app: this
      });
      // Start backbone history
      this.router.start();
      <% } else if (projectFeatures['hasBackbone'] !== true && projectFeatures['hasRactive'] === true) { %>
      // Create main application view
      this.mainView = new Ractive({
        el: this.$el,
        template: tApplication,
        data: {

        },
        partials: {
          loading: tLoading
        }
      });
      <% } else if (projectFeatures['hasBackbone'] !== true && projectFeatures['hasRactive'] !== true) { %>
      // Create main application view
      this.$content.html(_.template(tApplication, {
        data: {

        },
        loading: _.template(tLoading, {})
      }));
      <% } %>

      <% if (includeExamples) { %>
      // Run examples.  Please remove for real application.
      //
      // Because of how Ractive initializes and how Highcharts work
      // there is an inconsitency of when the container for the chart
      // is ready and when highcharts loads the chart.  So, we put a bit of
      // of a pause.
      //
      // In production, intializing a chart should be tied to data which
      // can be used with a Ractive observer.
      //
      // This should not happen with underscore templates.
      _.delay(function() { thisApp.makeExamples(); }, 400);
      <% } %>
    },

    <% if (includeExamples) { %>
    // Make some example depending on what parts were asked for in the
    // templating process.  Remove, rename, or alter this.
    makeExamples: function() {
      <% if (projectFeatures.hasHighcharts === true) { %>
      var exampleData = [{
        name: 'Example',
        data: [ 6 , 11, 32, 110, 235, 369, 640, 1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126, 27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662, 26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605, 24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586, 22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950, 10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104 ]
      }];

      // Line chart
      mpHighcharts.makeChart(this.$('.chart-line-example'),
        $.extend(true, {}, mpHighcharts.lineOptions, {
          colors: _.sample(_.values(mpConfig['colors-data']), 3),
          series: exampleData,
          legend: { enabled: false },
          yAxis: {
            title: { enabled: false }
          }
        }
      ));

      // Column chart
      mpHighcharts.makeChart(this.$('.chart-column-example'),
        $.extend(true, {}, mpHighcharts.columnOptions, {
          colors: _.sample(_.values(mpConfig['colors-data']), 3),
          series: exampleData,
          legend: { enabled: false }
        }
      ));
      <% } %>

      <% if (projectFeatures['hasDatatables'] === true) { %>
      <% } %>

      <% if (projectFeatures['hasMapbox'] === true) { %>
      <% } %>
      <% if (projectFeatures['hasLeaflet'] === true) { %>
      // Due to how Leaflet animates and (probably) how the CSS
      // is pulled in dynamically, the map gets offset, so we wait
      // just a moment and invalidate the size to reset the map
      window.setTimeout(function() {
        map.invalidateSize();
      }, 500);
      <% } %>
    },
    <% } %>

    // Default options
    defaultOptions: {
      projectName: '<%= projectName %>',
      remoteProxy: null,
      el: '.<%= projectName %>-container',
      availablePaths: {
        local: {
          <% if (projectPrerequisites.useCompass) { %>
          css: ['.tmp/css/main.css'],<% } else { %>
          css: ['styles/styles.css'],<% } %>
          images: 'images/',
          data: 'data/'
        },
        build: {
          css: [
            'dist/<%= projectName %>.libs.min.css',
            'dist/<%= projectName %>.latest.min.css'
          ],
          ie: [
            'dist/<%= projectName %>.libs.min.ie.css',
            'dist/<%= projectName %>.latest.min.ie.css'
          ],
          images: 'dist/images/',
          data: 'dist/data/'
        },
        deploy: {
          css: [
            'https://s3.amazonaws.com/data.minnpost/projects/<%= projectName %>/<%= projectName %>.libs.min.css',
            'https://s3.amazonaws.com/data.minnpost/projects/<%= projectName %>/<%= projectName %>.latest.min.css'
          ],
          ie: [
            'https://s3.amazonaws.com/data.minnpost/projects/<%= projectName %>/<%= projectName %>.libs.min.ie.css',
            'https://s3.amazonaws.com/data.minnpost/projects/<%= projectName %>/<%= projectName %>.latest.min.ie.css'
          ],
          images: 'https://s3.amazonaws.com/data.minnpost/projects/<%= projectName %>/<%= projectName %>/images/',
          data: 'https://s3.amazonaws.com/data.minnpost/projects/<%= projectName %>/<%= projectName %>/data/'
        }
      }
    },

    // Load up app
    loadApp: function() {
      this.determinePaths();
      this.getLocalAssests(function(map) {
        this.renderAssests(map);
        this.start();
      });
    },

    // Determine paths.  A bit hacky.
    determinePaths: function() {
      var query;
      this.options.deployment = 'deploy';

      if (window.location.host.indexOf('localhost') !== -1) {
        this.options.deployment = 'local';

        // Check if a query string forces something
        query = helpers.parseQueryString();
        if (_.isObject(query) && _.isString(query.mpDeployment)) {
          this.options.deployment = query.mpDeployment;
        }
      }

      this.options.paths = this.options.availablePaths[this.options.deployment];
    },

    // Get local assests, if needed
    getLocalAssests: function(callback) {
      var thisApp = this;

      // If local read in the bower map
      if (this.options.deployment === 'local') {
        $.getJSON('bower.json', function(data) {
          callback.apply(thisApp, [data.dependencyMap]);
        });
      }
      else {
        callback.apply(this, []);
      }
    },

    // Rendering tasks
    renderAssests: function(map) {
      var isIE = (helpers.isMSIE() && helpers.isMSIE() <= 8);

      // Add CSS from bower map
      if (_.isObject(map)) {
        _.each(map, function(c, ci) {
          if (c.css) {
            _.each(c.css, function(s, si) {
              $('head').append('<link rel="stylesheet" href="bower_components/' + s + '.css" type="text/css" />');
            });
          }
          if (c.ie && isIE) {
            _.each(c.ie, function(s, si) {
              $('head').append('<link rel="stylesheet" href="bower_components/' + s + '.css" type="text/css" />');
            });
          }
        });
      }

      // Get main CSS
      _.each(this.options.paths.css, function(c, ci) {
        $('head').append('<link rel="stylesheet" href="' + c + '" type="text/css" />');
      });
      if (isIE) {
        _.each(this.options.paths.ie, function(c, ci) {
          $('head').append('<link rel="stylesheet" href="' + c + '" type="text/css" />');
        });
      }

      // Add a processed class
      this.$el.addClass('inline-processed');
    }
  });

  return App;
});


/**
 * Run application
 */
require(['jquery', '<%= projectName %>'], function($, App) {
  $(document).ready(function() {
    var app = new App();
  });
});
