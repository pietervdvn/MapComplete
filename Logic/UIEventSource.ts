export class UIEventSource<T>{
    
    public data: T;
    private _callbacks = [];

    constructor(data: T) {
        this.data = data;
    }


    public addCallback(callback: ((latestData: T) => void)): UIEventSource<T> {
        this._callbacks.push(callback);
        return this;
    }

    public addCallbackAndRun(callback: ((latestData: T) => void)): UIEventSource<T> {
        callback(this.data);
        return this.addCallback(callback);
    }

    public setData(t: T): UIEventSource<T> {
        if (this.data === t) {
            return;
        }
        this.data = t;
        this.ping();
        return this;
    }

    public ping(): void {
        for (const callback of this._callbacks) {
            callback(this.data);
        }
    }

    public static flatten<X>(source: UIEventSource<UIEventSource<X>>, possibleSources: UIEventSource<any>[]): UIEventSource<X> {
        const sink = new UIEventSource<X>(source.data?.data);

        source.addCallback((latestData) => {
           sink.setData(latestData?.data);
        });

        for (const possibleSource of possibleSources) {
            possibleSource?.addCallback(() => {
                sink.setData(source.data?.data);
            })
        }
        
        return sink;
    }
    
    public map<J>(f: ((T) => J),
                  extraSources: UIEventSource<any>[] = [],
                  g: ((J) => T) = undefined ): UIEventSource<J> {
        const self = this;
        
        const newSource = new UIEventSource<J>(
            f(this.data)
        );
        
        const update = function () {
            newSource.setData(f(self.data));
        }

        this.addCallback(update);
        for (const extraSource of extraSources) {
            extraSource?.addCallback(update);
        }
      
        if(g !== undefined) {
            newSource.addCallback((latest) => {
                self.setData((g(latest)));
            })
        }
        
        return newSource;
    }

    
    public syncWith(otherSource: UIEventSource<T>) : UIEventSource<T>{
        this.addCallback((latest) => otherSource.setData(latest));
        const self = this;
        otherSource.addCallback((latest) => self.setData(latest));
        if(this.data === undefined){
           this.setData(otherSource.data);
        }else{
            otherSource.setData(this.data);
        }
        return this;
    }
    
    public stabilized(millisToStabilize) : UIEventSource<T>{
        
        const newSource = new UIEventSource<T>(this.data);
        
        let currentCallback = 0;
        this.addCallback(latestData => {
            currentCallback++;
            const thisCallback = currentCallback;
            window.setTimeout(() => {
                if(thisCallback === currentCallback){
                    newSource.setData(latestData);
                }
            }, millisToStabilize)
        });
        
        return newSource;
    }
    
    public static Chronic(millis: number):UIEventSource<Date>{
        const source = new UIEventSource<Date>(undefined);
        function run() {
            source.setData(new Date());
            window.setTimeout(run, millis);
        }
        run();
        return source;
        
    }

}