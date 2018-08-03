import registerServiceWorker from "./registerServiceWorker";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { RouteProps, RedirectProps, Switch, Route, Redirect } from "react-router";
import { BrowserRouter } from "react-router-dom";
export let PComponent = React.PureComponent;
export { React }

export let bootstrap = () => {
	return new Bootstrap();
};

export interface IBootstrap {
	with(App: React.ComponentClass): IBootstrap;
	does(work: () => Promise<void> | void): IBootstrap;
	mount(selector: string): IBootstrap;
	start(): void;
};

export let renderRouter = (routes: RouteProps[], redirect?: RedirectProps[]) => {
	return (
		<BrowserRouter basename="/">
			<Switch>
				{routes.map((x, i) => <Route key={i} {...x} />)}
				{redirect ? redirect.map((x, i) => <Redirect key={i} {...x} />) : null}
			</Switch>
		</BrowserRouter>
	);
};

class Bootstrap implements IBootstrap {
	private works: Array<() => Promise<void> | void> = [registerServiceWorker];
	private App: React.ComponentClass;
	private ele: Element;

	with(App: React.ComponentClass) {
		this.App = App;
		return this;
	}

	does(work: () => Promise<void> | void) {
		this.works.push(work);
		return this;
	}
	mount(selector: string) {
		let e = document.querySelector(selector);
		if (e) this.ele = e;
		else throw Error("找不到挂载点");
		return this;
	}
	start() {
		if (!this.ele || !this.App) throw Error("根组件与挂载点不可为空");
		let { works, App, ele } = this;
		ReactDOM.render(<App />, ele);
		works.forEach(f => f());
	}
}
