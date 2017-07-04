import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

//import { Container } from 'react-grid-system'

class UserPermissions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            permissions:{}
        };
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentWillMount() {
        //may add authorization headers?
        console.log('accessToken', this.props.accessToken)
        
        const res = await axios.get('/api/v1/authorization/permissions',
                        {
                            headers: {
                               'Authorization': 'Bearer'.concat(this.props.accessToken)
                            }
                        });
        const permissions = res.permissions;
        await this.setStateAsync({ permissions });
        console.log('state.permissions', this.state.permissions)
        console.log('permissions', permissions)
    }

    /*
    {
     admin: [],
     advisor: [ '/FARM1', '/FARM2' ],
     farmer: [ '/FARM2' ]
    } => (role, entities)
     */

    /* a library
     isAdmin
     canManageUsers
     canDefineFarmers
     this.state.permissions.map( 
                permission => 
                     (<g><p> permission.key: </p>  <p> permission.value.map(entity => entity) </p></g>)
     */

    render() {
        return (            
            <p>{JSON.stringify(this.state.permissions)}</p>
            )
        
    }
}

function mapStateToProps(state) {
  return {
      accessToken: state.keycloak.token,
  };
}

export default connect(mapStateToProps)(UserPermissions);