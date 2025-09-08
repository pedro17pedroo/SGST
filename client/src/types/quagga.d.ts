declare module 'quagga' {
  interface QuaggaJSConfigObject {
    inputStream: {
      name: string;
      type: string;
      target: HTMLElement | string;
      constraints?: {
        width: number;
        height: number;
        facingMode: string;
      };
    };
    locator: {
      patchSize: string;
      halfSample: boolean;
    };
    numOfWorkers: number;
    decoder: {
      readers: string[];
    };
    locate: boolean;
  }

  interface QuaggaJSResultObject {
    codeResult: {
      code: string;
    };
  }

  const Quagga: {
    init: (config: QuaggaJSConfigObject, callback: (err: any) => void) => void;
    start: () => void;
    stop: () => void;
    onDetected: (callback: (result: QuaggaJSResultObject) => void) => void;
    offDetected: (callback: (result: QuaggaJSResultObject) => void) => void;
  };

  export default Quagga;
}