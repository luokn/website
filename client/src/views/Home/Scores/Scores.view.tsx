import * as React from "react";
import "./Scores.view.less";
import { inject, observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import RinkCard from "../../../components/RinkCard/RinkCard";
import { Tips } from "../../../common/config/Tips";
import ScoresList from "../../../components/ScoresList/ScoresList";
import { WhutStudent } from "../../../common/stores/WhutStudent";
import {
	nullable,
	getToken,
	match,
	removeToken,
	parseStatus
} from "../../../utils";
import { request } from "../../../API/request";
import { message, Tabs, Modal, Button, Row, Select } from "antd";
import { Status } from "../../../API/Status";

interface IScoresViewPorps extends RouteComponentProps<any> {
	student: WhutStudent | nullable;
}

@inject("student")
@observer
class ScoresView extends React.Component<IScoresViewPorps> {
	state = {
		loading: true,
		year: "*"
	};
	componentWillMount() {
		let { rink, scores } = this.props.student!;
		if (!rink || scores.length == 0) this.loadScores(true);
		else this.setState({ loading: false });
	}
	async loadScores(reload: boolean) {
		await request("/api/whut/scores")
			.auth(getToken()!)
			.with({
				before: () => {
					this.setState({ loading: false });
				},
				onOk: ({ scores }) => {
					const { student } = this.props;
					if (scores) student!.setScores(scores);
					this.setState({ loadingRink: false });
					message.info(Tips.Ok);
				},
				onWhutIdNotFind: () => {
					message.warn(Tips.NoStudent);
				},
				onWhutCrashed: () => {
					message.error(Tips.WhutServerCrashed)
				},
				on401Unauthorized: () => {
					message.warn(Tips.TokenExpires, () => {
						removeToken();
						this.props.history.push("/login", {
							from: this.props.location.pathname
						});
					})
				},
				on423Locked: () => {
					message.error(Tips.Locked)
				},
				onUnknownError: () => {
					message.error(Tips.NetworkError);
				},
			})
			.get();
	}
	refresh() {
		this.setState({ loading: true });
		Modal.confirm({
			title: "是否清空服务器缓存？",
			content: "清空缓存将对教务处重新发起请求",
			okText: "是",
			okType: "danger",
			cancelText: "否",
			onOk: async () => await this.loadScores(false),
			onCancel: async () => await this.loadScores(true)
		});
	}
	gotologin() {
		this.props.history.push("/login", {
			from: this.props.location.pathname
		});
	}
	render() {
		let { rink, scores } = this.props.student!;
		let { loading, year } = this.state;
		const yearSet = new Set(scores.map(x => x.schoolYear));
		return (
			<div className="scores-views">
				<Tabs defaultActiveKey="2">
					<Tabs.TabPane tab="绩点排名" key="1">
						<RinkCard loading={loading} data={rink} />
					</Tabs.TabPane>
					<Tabs.TabPane tab="考试成绩" key="2">
						<div className="cp-controller">
							<span
								style={{
									fontSize: 16,
									fontWeight: 600,
									letterSpacing: 2
								}}
							>
								学年：
							</span>
							<Select
								defaultValue={year}
								style={{ minWidth: 140, marginRight: 20 }}
								onChange={p => this.setState({ year: p })}
							>
								<Select.Option value="*">全部</Select.Option>
								{Array.from(yearSet).map((y, i) => (
									<Select.Option key={i} value={y}>
										{y}
									</Select.Option>
								))}
							</Select>
							<Button
								style={{ float: "right" }}
								type="dashed"
								onClick={() => this.refresh()}
								icon="reload"
							>
								刷新
							</Button>
						</div>
						<div className="ph-controller">
							<Select
								size="small"
								defaultValue={year}
								style={{ minWidth: 120, marginRight: 5 }}
								onChange={p => this.setState({ year: p })}
							>
								<Select.Option value="*">全部</Select.Option>
								{Array.from(yearSet).map((y, i) => (
									<Select.Option key={i} value={y}>
										{y}
									</Select.Option>
								))}
							</Select>
							<span style={{ fontSize: 14 }}>学年</span>
							<Button
								size="small"
								style={{ float: "right" }}
								type="dashed"
								onClick={() => this.refresh()}
								icon="reload"
							>
								刷新
							</Button>
						</div>
						<div style={{ padding: "0 25px 0 25px" }}>
							<ScoresList
								year={year}
								loading={loading}
								data={scores}
							/>
						</div>
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}

export default ScoresView;
