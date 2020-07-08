export class UIEventSource<T>{
    
    public data : T;
    private _callbacks = [];

    constructor(data: T) {
        this.data = data;
    }


    public addCallback(callback: ((latestData : T) => void)) {
        this._callbacks.push(callback);
        return this;
    }

    public setData(t: T): void {
        if (this.data === t) {
            return;
        }
        this.data = t;
        this.ping();
    }

    public ping(): void {
        for (const callback of this._callbacks) {
            callback(this.data);
        }
    }

    public map<J>(f: ((T) => J),
                  extraSources : UIEventSource<any>[] = []): UIEventSource<J> {
        const self = this;
        
        const update = function () {
            newSource.setData(f(self.data));
            newSource.ping();
        }
        
        this.addCallback(update);
        for (const extraSource of extraSources) {
            extraSource.addCallback(update);
        }
        const newSource = new UIEventSource<J>(
            f(this.data)
        );
        

        return newSource;

    }


}