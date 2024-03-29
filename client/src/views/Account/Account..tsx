import * as React from 'react'
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { renderSwitch } from '../../utils';
import { vistorRequired } from '../../containers/Auth/Auth';
import { account } from '../../routes';


class Account extends React.Component<RouteComponentProps<{}>> {
	state = {
		collapsed: false
	}
	render() {
		return <Layout>
			<Layout.Content style={{ backgroundColor: '#fff', minHeight: 630 }}>
				{renderSwitch(account)}
			</Layout.Content>
		</Layout>
	}
}

export default vistorRequired(withRouter(Account))
