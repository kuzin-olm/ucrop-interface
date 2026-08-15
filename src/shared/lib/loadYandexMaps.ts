export type YandexGeometry = {
  getCoordinates: () => number[][][] | null;
  setCoordinates: (coordinates: number[][][] | []) => void;
};

export type YandexEditor = {
  startDrawing: () => void;
  stopDrawing: () => void;
  startEditing: () => void;
  stopEditing: () => void;
  events: {
    add: (type: string | string[], handler: () => void) => void;
    remove: (type: string | string[], handler: () => void) => void;
  };
};

export type YandexGeoObject = {
  events: {
    add: (type: string, handler: () => void) => void;
  };
  options: {
    set: (key: string, value: unknown) => void;
  };
  geometry?: YandexGeometry;
  editor?: YandexEditor;
};

export type YandexMap = {
  geoObjects: {
    add: (object: YandexGeoObject) => void;
    removeAll: () => void;
    getBounds: () => number[][] | null;
  };
  controls: {
    get: (name: string) => { options: { set: (value: Record<string, unknown>) => void } } | undefined;
  };
  setBounds: (
    bounds: number[][],
    options?: { checkZoomRange?: boolean; zoomMargin?: number | number[] },
  ) => void;
  destroy: () => void;
};

export type YandexMapsApi = {
  ready: (callback?: () => void) => Promise<void> | void;
  Map: new (
    element: HTMLElement,
    state: { center: number[]; zoom: number; type?: string; controls?: string[] },
    options?: Record<string, unknown>,
  ) => YandexMap;
  Polygon: new (
    geometry: number[][][],
    properties: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YandexGeoObject;
  Placemark: new (
    geometry: number[],
    properties: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YandexGeoObject;
};

declare global {
  interface Window {
    ymaps?: YandexMapsApi;
  }
}

const SCRIPT_ID = 'yandex-maps-jsapi-2-1';

function whenReady(api: YandexMapsApi): Promise<YandexMapsApi> {
  return new Promise((resolve) => {
    void api.ready(() => resolve(api));
  });
}

let pending: Promise<YandexMapsApi> | null = null;

export function loadYandexMaps(): Promise<YandexMapsApi> {
  if (window.ymaps) {
    return whenReady(window.ymaps);
  }

  if (pending) {
    return pending;
  }

  pending = new Promise((resolve, reject) => {
    const params = new URLSearchParams({ lang: 'ru_RU' });
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
    if (apiKey) {
      params.set('apikey', apiKey);
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://api-maps.yandex.ru/2.1/?${params.toString()}`;
    script.async = true;
    script.onload = () => {
      if (!window.ymaps) {
        pending = null;
        reject(new Error('Yandex Maps API is unavailable'));
        return;
      }
      void whenReady(window.ymaps).then(resolve);
    };
    script.onerror = () => {
      pending = null;
      reject(new Error('Не удалось загрузить API Яндекс Карт'));
    };
    document.head.appendChild(script);
  });

  return pending;
}
