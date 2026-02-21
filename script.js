document.addEventListener("DOMContentLoaded", function() {
  const numLines = 10;
  const container = document.body;
  
  for (let i = 0; i < numLines; i++) {
      let line = document.createElement('div');
      line.className = 'animated-line';
      container.appendChild(line);
      animateLine(line, i * 2000);
  }
  
  function animateLine(line, delay) {
      setTimeout(() => {
          line.style.top = `${Math.random() * 100}vh`;
          line.style.left = `${Math.random() * 100}vw`;
          line.style.animation = 'moveLine 5s linear infinite';
      }, delay);
  }
    const collectionStatsSearchApi = 'https://api-mainnet.magiceden.dev/collection_stats/search/bitcoin';
    const collectionStatsByIdApi = 'https://api-mainnet.magiceden.dev/collection_stats/stats?chain=bitcoin&collectionId=';
    const corsProxyBase = 'https://api.allorigins.win/raw?url=';

    const collectionSupplyOverrides = {
        'blok-boyz': 1000,
        'blok-space': 1000
    };

    function parseNumber(value) {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;

        const normalized = String(value).replace(/,/g, '').trim().toLowerCase();
        if (!normalized) return null;

        const compactMatch = normalized.match(/^(-?\d+(?:\.\d+)?)\s*([kmb])(?:\b|$)/i);
        if (compactMatch) {
            const base = Number(compactMatch[1]);
            const suffix = compactMatch[2].toLowerCase();
            const multiplier = suffix === 'k' ? 1e3 : suffix === 'm' ? 1e6 : 1e9;
            const compactValue = base * multiplier;
            return Number.isFinite(compactValue) ? compactValue : null;
        }

        const direct = Number(normalized);
        if (Number.isFinite(direct)) return direct;

        const extracted = normalized.match(/-?\d+(?:\.\d+)?/);
        if (!extracted) return null;

        const extractedValue = Number(extracted[0]);
        return Number.isFinite(extractedValue) ? extractedValue : null;
    }

    function formatCount(value) {
        const parsed = parseNumber(value);
        return parsed === null ? '--' : Math.round(parsed).toLocaleString('en-US');
    }

    function formatBtc(value) {
        const parsed = parseNumber(value);
        if (parsed === null) return '--';
        const maxFractionDigits = parsed >= 1 ? 2 : 4;
        return `${parsed.toLocaleString('en-US', { maximumFractionDigits: maxFractionDigits })} BTC`;
    }

    function setStatValue(statsWindow, statName, value) {
        const stat = statsWindow.querySelector(`[data-stat="${statName}"]`);
        if (stat) stat.textContent = value;
    }

    function clearStats(statsWindow) {
        setStatValue(statsWindow, 'floor', '--');
        setStatValue(statsWindow, 'volume-24h', '--');
        setStatValue(statsWindow, 'volume-total', '--');
        setStatValue(statsWindow, 'listed', '--');
        setStatValue(statsWindow, 'owners', '--');
        setStatValue(statsWindow, 'supply', '--');
    }

    function setStatus(statsWindow, message, isError) {
        const statsStatus = statsWindow.querySelector('.collection-stats-status');
        if (!statsStatus) return;
        statsStatus.textContent = message;
        statsStatus.classList.toggle('is-error', Boolean(isError));
    }

    function setUpdated(statsWindow, message) {
        const statsUpdated = statsWindow.querySelector('.collection-stats-updated');
        if (statsUpdated) statsUpdated.textContent = message;
    }

    function buildProxiedUrl(url) {
        return `${corsProxyBase}${encodeURIComponent(url)}`;
    }

    function satsToBtc(value) {
        const parsed = parseNumber(value);
        return parsed === null ? null : parsed / 100000000;
    }

    async function fetchJsonWithFallback(url) {
        const requestUrls = [url, buildProxiedUrl(url)];
        let lastError = null;

        for (const requestUrl of requestUrls) {
            try {
                const response = await fetch(requestUrl, {
                    headers: { Accept: 'application/json' }
                });
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Failed to load JSON payload');
    }

    async function fetchTextWithFallback(url) {
        const requestUrls = [url, buildProxiedUrl(url)];
        let lastError = null;

        for (const requestUrl of requestUrls) {
            try {
                const response = await fetch(requestUrl);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return await response.text();
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Failed to load text payload');
    }

    function mapSearchStats(rawStats) {
        if (!rawStats || typeof rawStats !== 'object') return null;
        return {
            source: 'Magic Eden collection stats API',
            floorPrice: rawStats.fp ?? rawStats.fpListingPrice,
            volume24h: rawStats.vol,
            totalVolume: rawStats.totalVol,
            listedCount: rawStats.listedCount,
            ownerCount: rawStats.ownerCount,
            totalSupply: rawStats.totalSupply
        };
    }

    function mapCollectionStatsById(rawStats) {
        if (!rawStats || typeof rawStats !== 'object') return null;

        return {
            source: 'Magic Eden collection stats API',
            floorPrice: rawStats.floorPrice?.native ?? satsToBtc(rawStats.floorPrice?.amount),
            volume24h: satsToBtc(rawStats.volume24hr ?? rawStats.volume24h),
            totalVolume: satsToBtc(rawStats.totalVol),
            listedCount: rawStats.listedCount,
            ownerCount: rawStats.ownerCount,
            totalSupply: rawStats.tokenCount ?? rawStats.totalSupply ?? rawStats.supply
        };
    }

    function parseMarketplaceStats(html) {
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
        if (!nextDataMatch || !nextDataMatch[1]) return null;

        let nextData;
        try {
            nextData = JSON.parse(nextDataMatch[1]);
        } catch (error) {
            return null;
        }

        const statRows = nextData?.props?.pageProps?.stats;
        if (!Array.isArray(statRows) || statRows.length === 0) return null;

        const readStat = function(traitName) {
            const row = statRows.find(item => {
                return String(item?.trait_type || '').toLowerCase() === traitName.toLowerCase();
            });
            return row ? row.value : null;
        };

        return {
            source: 'Magic Eden marketplace page',
            floorPrice: readStat('Floor Price'),
            volume24h: readStat('24h Vol'),
            totalVolume: readStat('All Vol'),
            listedCount: readStat('Listed'),
            ownerCount: readStat('Owners'),
            totalSupply: readStat('Total Supply')
        };
    }

    function findCollectionStatsInPayload(searchPayload, collectionSymbol) {
        if (!Array.isArray(searchPayload)) return null;
        return searchPayload.find(item => {
            const symbol = String(item?.collectionSymbol || '').toLowerCase();
            const collectionId = String(item?.collectionId || '').toLowerCase();
            return symbol === collectionSymbol || collectionId === collectionSymbol;
        }) || null;
    }

    async function refreshCollectionStats(statsWindow, sharedSearchPayload) {
        const collectionSymbol = String(statsWindow.dataset.collectionSymbol || '').trim().toLowerCase();
        if (!collectionSymbol) return;

        const statsRefresh = statsWindow.querySelector('.collection-stats-refresh');
        const collectionStatsPageUrl = `https://magiceden.io/ordinals/marketplace/${collectionSymbol}`;

        if (statsRefresh) statsRefresh.disabled = true;
        setStatus(statsWindow, 'Fetching Magic Eden stats...', false);

        try {
            let mappedStats = null;
            let searchPayload = sharedSearchPayload;

            try {
                const perCollectionStats = await fetchJsonWithFallback(
                    `${collectionStatsByIdApi}${encodeURIComponent(collectionSymbol)}`
                );
                mappedStats = mapCollectionStatsById(perCollectionStats);
            } catch (error) {
                mappedStats = null;
            }

            if (!Array.isArray(searchPayload)) {
                try {
                    searchPayload = await fetchJsonWithFallback(collectionStatsSearchApi);
                } catch (error) {
                    searchPayload = null;
                }
            }

            const matchedStats = findCollectionStatsInPayload(searchPayload, collectionSymbol);
            if (!mappedStats && matchedStats) {
                mappedStats = mapSearchStats(matchedStats);
            }

            if (!mappedStats) {
                const pageHtml = await fetchTextWithFallback(collectionStatsPageUrl);
                mappedStats = parseMarketplaceStats(pageHtml);
            }

            if (!mappedStats) {
                throw new Error(`Could not locate collection stats for ${collectionSymbol}`);
            }

            setStatValue(statsWindow, 'floor', formatBtc(mappedStats.floorPrice));
            setStatValue(statsWindow, 'volume-24h', formatBtc(mappedStats.volume24h));
            setStatValue(statsWindow, 'volume-total', formatBtc(mappedStats.totalVolume));
            setStatValue(statsWindow, 'listed', formatCount(mappedStats.listedCount));
            setStatValue(statsWindow, 'owners', formatCount(mappedStats.ownerCount));
            const resolvedSupply = parseNumber(mappedStats.totalSupply) ?? collectionSupplyOverrides[collectionSymbol] ?? null;
            setStatValue(statsWindow, 'supply', formatCount(resolvedSupply));

            setUpdated(statsWindow, `Updated ${new Date().toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            })}`);
            setStatus(statsWindow, `Live data from ${mappedStats.source}`, false);
        } catch (error) {
            clearStats(statsWindow);
            setUpdated(statsWindow, 'Update failed');
            setStatus(statsWindow, 'Unable to load collection stats right now.', true);
            console.error(`Collection stats load failed (${collectionSymbol}):`, error);
        } finally {
            if (statsRefresh) statsRefresh.disabled = false;
        }
    }

    const statsWindows = Array.from(document.querySelectorAll('.collection-stats-window[data-collection-symbol]'));
    if (statsWindows.length > 0) {
        statsWindows.forEach(statsWindow => {
            const collectionName = statsWindow.dataset.collectionName;
            const nameNode = statsWindow.querySelector('.collection-stats-name');
            if (collectionName && nameNode) nameNode.textContent = collectionName;

            const statsRefresh = statsWindow.querySelector('.collection-stats-refresh');
            if (statsRefresh) {
                statsRefresh.addEventListener('click', () => {
                    refreshCollectionStats(statsWindow);
                });
            }
        });

        (async function initializeAllCollectionStats() {
            let sharedSearchPayload = null;
            try {
                sharedSearchPayload = await fetchJsonWithFallback(collectionStatsSearchApi);
            } catch (error) {
                sharedSearchPayload = null;
            }

            await Promise.all(statsWindows.map(statsWindow => {
                return refreshCollectionStats(statsWindow, sharedSearchPayload);
            }));
        })();
    }
    // Gallery-grid search: inject an <input> before each grid.
    // Matching results are moved below the search bar while searching.
document.querySelectorAll('.gallery-grid').forEach(grid => {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Search by Collection ID';
        input.className = 'gallery-search';
        grid.parentNode.insertBefore(input, grid);

        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'gallery-grid gallery-search-results';
        resultsGrid.style.display = 'none';
        input.parentNode.insertBefore(resultsGrid, grid);

        const gridSymbol = String(grid.dataset.collectionSymbol || '').trim().toLowerCase();
        if (gridSymbol) {
            const linkedStatsWindow = document.querySelector(`.collection-stats-window[data-collection-symbol="${gridSymbol}"]`);
            if (linkedStatsWindow) {
                input.insertAdjacentElement('afterend', linkedStatsWindow);
                linkedStatsWindow.classList.remove('collection-stats-window--hero');
            }
        }

        let originalItems = null;
        let loadMoreDisplayBeforeSearch = null;
        let itemDisplayBeforeSearch = null;

        function getGalleryItems() {
            const wrappedItems = Array.from(grid.querySelectorAll('.gallery-item'));
            if (wrappedItems.length > 0) return wrappedItems;
            return Array.from(grid.querySelectorAll('img'));
        }

        function ensureOriginalItems() {
            if (!originalItems) {
                originalItems = getGalleryItems();
            }
        }

        function getImageFromItem(item) {
            if (!item) return null;
            if (item.tagName === 'IMG') return item;
            return item.querySelector('img');
        }

        function normalizeCollectionId(value) {
            const normalized = String(value || '').trim().toLowerCase();
            if (/^\d+$/.test(normalized)) {
                return String(parseInt(normalized, 10));
            }
            return normalized;
        }

        function itemMatchesQuery(item, normalizedQuery) {
            const img = getImageFromItem(item);
            if (!img) return false;
            const src = img.getAttribute('src') || '';
            const name = src.split('/').pop().toLowerCase();
            const collectionId = name.split('?')[0].replace(/\.[^.]+$/, '');
            return normalizeCollectionId(collectionId) === normalizedQuery;
        }

        function getLoadMoreButton() {
            let node = grid.nextElementSibling;
            while (node) {
                if (node.classList && node.classList.contains('load-more-button')) return node;
                node = node.nextElementSibling;
            }
            return null;
        }

        function restoreOriginalGrid() {
            ensureOriginalItems();
            const fragment = document.createDocumentFragment();
            originalItems.forEach(item => fragment.appendChild(item));
            grid.appendChild(fragment);

            if (itemDisplayBeforeSearch) {
                originalItems.forEach(item => {
                    const previousDisplay = itemDisplayBeforeSearch.get(item);
                    item.style.display = previousDisplay === undefined ? '' : previousDisplay;
                });
            }

            resultsGrid.style.display = 'none';
            resultsGrid.replaceChildren();
            grid.style.display = '';

            const loadMoreBtn = getLoadMoreButton();
            if (loadMoreBtn) {
                loadMoreBtn.style.display = loadMoreDisplayBeforeSearch === null ? '' : loadMoreDisplayBeforeSearch;
            }
            loadMoreDisplayBeforeSearch = null;
            itemDisplayBeforeSearch = null;
        }

        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            if (!q) {
                restoreOriginalGrid();
                return;
            }
            const normalizedQuery = normalizeCollectionId(q);

            ensureOriginalItems();
            const fragment = document.createDocumentFragment();

            if (!itemDisplayBeforeSearch) {
                itemDisplayBeforeSearch = new Map();
                originalItems.forEach(item => {
                    itemDisplayBeforeSearch.set(item, item.style.display);
                });
            }

            originalItems.forEach(item => {
                if (itemMatchesQuery(item, normalizedQuery)) {
                    item.style.display = '';
                    fragment.appendChild(item);
                }
            });

            resultsGrid.replaceChildren(fragment);
            resultsGrid.style.display = '';
            grid.style.display = 'none';

            const loadMoreBtn = getLoadMoreButton();
            if (loadMoreBtn) {
                if (loadMoreDisplayBeforeSearch === null) {
                    loadMoreDisplayBeforeSearch = loadMoreBtn.style.display;
                }
                loadMoreBtn.style.display = 'none';
            }
        });
    });

    // Some collections use non-grid layouts (iframe/flex). Keep their stats
    // placement consistent by anchoring directly beneath the marketplace link.
    ['blokchain-surveillance', 'art-drops'].forEach(collectionSymbol => {
        const statsWindow = document.querySelector(`.collection-stats-window[data-collection-symbol="${collectionSymbol}"]`);
        const marketplaceLink = document.querySelector(`a[href*="/marketplace/${collectionSymbol}"]`);
        if (!statsWindow || !marketplaceLink) return;
        marketplaceLink.insertAdjacentElement('afterend', statsWindow);
        statsWindow.classList.remove('collection-stats-window--hero');
    });
});