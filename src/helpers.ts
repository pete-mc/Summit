import { TerrainCache } from "../typings/summitTypes";
import $ from 'jquery';

//function to initiate a local store for caching data with an array of items containing Type, Data & TTL
export function initCache(): void {
    if (localStorage.getItem('SummitTerrainCache') === null) {
        localStorage.setItem('SummitTerrainCache', JSON.stringify([]));
    }
    //clear cache items if it is older than 5 mins
    const cache: TerrainCache = JSON.parse(localStorage.getItem('SummitTerrainCache') || '[]');
    const now = new Date();
    cache.forEach(item => {
        if (item.ttl < now.getTime()) {
            clearCacheItem(item.type);
        }
    });
}

//function to add an item to the cache
export function addToCache(type: string, data: any, ttl:number): any {
    let cache = JSON.parse(localStorage.getItem('SummitTerrainCache') || '[]');
    cache.push({type: type, data: data, ttl: ttl});
    localStorage.setItem('SummitTerrainCache', JSON.stringify(cache));
    //trigger to clear this item from cache when ttl expires
    setTimeout(() => { clearCacheItem(type); }, ttl * 1000);
    return data;
}

//function to clear an item from the cache
export function clearCacheItem(type: string): void {
    let cache: TerrainCache = JSON.parse(localStorage.getItem('SummitTerrainCache') || '[]');
    cache = cache.filter(item => item.type !== type);
    localStorage.setItem('SummitTerrainCache', JSON.stringify(cache));
}

//function to clear the cache
export function clearCache() {
    if (localStorage.getItem('SummitTerrainCache') != null) {
        localStorage.removeItem('SummitTerrainCache');
    }
    localStorage.setItem('SummitTerrainCache', JSON.stringify([]));   
}

//function to get a cache item
export function getCacheItem(type: string): any {
    initCache();
    const cache: TerrainCache = JSON.parse(localStorage.getItem('SummitTerrainCache') || '[]');
    const cacheItem = cache.find(item => item.type === type);
    if (cacheItem) {
        return cacheItem.data;
    }
    return undefined;
}

// Function to get a random color
export function getRandomColor(): string {
    return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},1)`;
}

//xpath jquery function
$.fn.xpath  = function(expr) {
    var found = [];
    var context = this[0];
    var result = document.evaluate(expr, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    var node;
    while (node = result.iterateNext()) {
            found.push(node);
    }
    return $(found);
};

// Function to throttle other functions
export function throttle(func: (...args: any[]) => void, limit: number): (...args: any[]) => void {
    let lastRan: number;
    let lastFunc: NodeJS.Timeout;
    return function debounced(this: any, ...args: any[]): void {
        const context = this;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
