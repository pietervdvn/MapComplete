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
        for (let i in this._callbacks) {
            this._callbacks[i](this.data);
        }
    }

    public map<J>(f: ((T) => J)): UIEventSource<J> {
        const self = this;
        this.addCallback(function () {
            newSource.setData(f(self.data));
            newSource.ping();
        });
        const newSource = new UIEventSource<J>(
            f(this.data)
        );

        return newSource;

    }


}