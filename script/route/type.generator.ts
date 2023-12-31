import * as fs from 'fs';

import { OPTIONS, RouteConfigItem } from '.';
import { formatFile } from './utils';

/**
 * 生成类型定义
 */
export default function generateRouteType(routeConfigItem: RouteConfigItem[]) {
  // 生成aliases类型
  // 生成aliases和完整路由的映射
  // 生成参数类型
  const aliases: Record<string, string> = {};
  const aliasesToPathMap: Record<string, string> = {};
  const params: Record<string, any> = {};
  routeConfigItem.forEach((item) => {
    // TODO 检查重复别名
    if (Array.isArray(item.aliases)) {
      item.aliases.forEach((alias) => {
        aliases[alias] = alias;
        aliasesToPathMap[alias] = '/' + item.page;
        params[`[ROUTE.${alias}]`] = parseParams(item);
      });
    } else {
      aliases[item.aliases] = item.aliases;
      aliasesToPathMap[item.aliases] = '/' + item.page;
      params[`[ROUTE.${item.aliases}]`] = parseParams(item);
    }
  });

  const aliasesToPathMapContent = `
    enum ROUTE_ALIASES_MAP 
    ${JSON.stringify(aliasesToPathMap).replaceAll(':', '=')}
    
    
    export default ROUTE_ALIASES_MAP
  `;

  const pathToAliasesMap = Object.entries(aliasesToPathMap).reduce((ret, entry) => {
    const [key, value] = entry;
    ret[value] = key;
    ret[value.slice(1)] = key;
    return ret;
  }, {});

  const pathToAliasesMapContent = `
    enum PATH_TO_ALIASES_MAP
    ${JSON.stringify(pathToAliasesMap).replaceAll(':', '=')}

    export default PATH_TO_ALIASES_MAP
  `;

  const aliasesContent = `
     export enum ROUTE 
      ${JSON.stringify(aliases).replaceAll(':', '=')}
    
  `;

  const paramsContent = `
    ${aliasesContent}

    export default interface RouterParams extends Record<ROUTE, any>
      ${JSON.stringify(params).replaceAll('"', '')}
    
    
  `;

  fs.writeFileSync(OPTIONS.files.aliases_to_path, aliasesToPathMapContent);
  formatFile(OPTIONS.files.aliases_to_path);
  fs.writeFileSync(OPTIONS.files.path_to_aliases, pathToAliasesMapContent);
  formatFile(OPTIONS.files.path_to_aliases);
  fs.writeFileSync(OPTIONS.files.params, paramsContent);
  formatFile(OPTIONS.files.params);
}

/**
 * 解析参数
 */
function parseParams(routeConfigItem: RouteConfigItem) {
  const params: Record<string, string> = {};

  routeConfigItem.params?.forEach((param) => {
    params[param] = 'any';
  });

  return params;
}
