const { join, relative, extname } = require('path');
const { stringifyRequest, getOptions } = require('loader-utils');
const { SourceMapGenerator } = require('source-map');
const { makeMap, compileES5, QueryString } = require('./shared/utils');
const { injectThisScope } = require('sfc-compiler');
const parseSFC = require('./parser/page-sfc');
const paths = require('./paths');

const tplLoaderPath = require.resolve('./template');

module.exports = function(content, rawMap) {
  const { type, globalStyle } = getOptions(this);
  const { resourcePath } = this;
  const relativePath = relative(this.rootContext, this.resourcePath);

  let regPageName = relativePath.slice(0, -extname(relativePath).length);
  regPageName = String(regPageName).replace(/\\/g, '/'); // for windows
  const pageInfo = JSON.stringify({
    path: regPageName
  });

  const { template, style, script } = parseSFC(resourcePath, {
    script: content,
    type
  });

  const { code: scriptContent, map } = compileES5(script.content, {
    sourceMaps: true,
    sourceFileName: relativePath,
  });

  const tplQueryString = new QueryString({
    type,
    globalStyle,
    stylePath: style ? style.path : 'null',
    isPage: true
  });
  const tplRequirement = stringifyRequest(this, `${tplLoaderPath}?${tplQueryString}!${template.path}`);

  let source = `;(function(__registerPage__, __renderFactory__, getApp){__registerPage__(${pageInfo}, __renderFactory__, function(Page){
${scriptContent}
    });
  })(
    require(${stringifyRequest(this, paths.registerPage)}).default,
    require(${tplRequirement}),
    require(${stringifyRequest(this, paths.getApp)}).default
  );`;

  // 往下滑行一行, 因为上面加了一行 👆
  map.mappings = ';' + map.mappings;
  this.callback(null, source, this.sourceMap ? map : void 0);
};
