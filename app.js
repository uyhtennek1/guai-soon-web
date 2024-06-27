const ALL_ROUTES_API = "https://data.etabus.gov.hk/v1/transport/kmb/route/";
const ROUTE_STOPS_API = (route, direction, serviceType) => `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${direction}/${serviceType}`;
const ALL_STOPS_API = "https://data.etabus.gov.hk/v1/transport/kmb/stop";

const $routeInput = document.querySelector('#route-search');
const $routesTable = document.querySelector('#route-table tbody');
const $routeStopTable = document.querySelector('#route-stop-list tbody');
const $routeStopInfoModal = document.querySelector('#route-stop-info');

(async () => {
    const fetchRoutes = fetch(ALL_ROUTES_API);
    const fetchStops = fetch(ALL_STOPS_API);
    await Promise.all([fetchRoutes, fetchStops]);

    const routes_res = await fetchRoutes;
    const stops_res = await fetchStops;
    const routes = (await routes_res.json()).data;
    const stops = (await stops_res.json()).data;

    $routeInput.addEventListener('input', evt => {
        
        const input = evt.target.value.toUpperCase();
        const searchResult = routes.filter(x => x.route.startsWith(input));

        $routesTable.replaceChildren(...searchResult.map(x => {
            const $row = document.createElement('tr');
            const $head = document.createElement('th');
            const $orig_cell = document.createElement('td');
            const $dest_cell = document.createElement('td');

            $head.textContent = x.route;
            $orig_cell.textContent = x.orig_tc;
            $dest_cell.textContent = x.dest_tc;

            $row.replaceChildren($head, $orig_cell, $dest_cell);
            $row.classList.add('cursor-pointer');
            $row.addEventListener('click', async evt => {
                $routesTable.replaceChildren($row);

                const routeStops_res = await fetch(ROUTE_STOPS_API(x.route, x.bound === 'O' ? 'outbound' : 'inbound', x.service_type));
                const routeStops = (await routeStops_res.json()).data;

                const $items = routeStops.map(x => {
                    const $row = document.createElement('tr');
                    const $head = document.createElement('th');
                    const $cell = document.createElement('td');

                    const stopName = stops.find(y => y.stop === x.stop).name_tc;

                    $head.textContent = x.seq;
                    $cell.textContent = stopName;

                    $row.classList.add('cursor-pointer');
                    $row.addEventListener('click', evt => {
                        $routeStopInfoModal.showModal();
                    });

                    $row.replaceChildren($head, $cell);
                    return $row;
                });

                $routeStopTable.replaceChildren(...$items);
            });

            return $row;
        }));
    });
})();

// Loading
