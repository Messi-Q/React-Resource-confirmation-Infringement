import React, {Component} from 'react';
// import classnames from 'classnames';
import {connect} from 'react-redux';
import {fetchAllWebResource, fetchBlockUser, updateBlockToken} from '../../actions/allResourceActions';
import {fetchBalance} from '../../actions/rechargeAction';
import {Redirect} from "react-router-dom";

class ResourceTxPage extends Component {
    state = {
        resourceId: this.props.allWebResource ? this.props.allWebResource.resourceId : '',
        headline: this.props.allWebResource ? this.props.allWebResource.headline : '',
        coverUrl: this.props.allWebResource ? this.props.allWebResource.coverUrl : '',
        readPrice: this.props.allWebResource ? this.props.allWebResource.readPrice : '',
        owner: this.props.allWebResource ? this.props.allWebResource.owner : '',
        ownershipPrice: this.props.allWebResource ? this.props.allWebResource.ownershipPrice : '',
        readCount: this.props.allWebResource ? this.props.allWebResource.readCount : '',
        liked: this.props.allWebResource ? this.props.allWebResource.liked : '',
        file: this.props.allWebResource ? this.props.allWebResource.file : '',
        balance: this.props.localUser ? this.props.localUser.balance : '',
        errors: {},
        succeed: false,
        loading: false,
        done: false
    };

    componentDidMount() {
        setTimeout(() => {
            const {user} = this.props.userLogin;
            console.log("userId", user);
            //获取购买者的余额
            this.props.fetchBalance(user.id)
                .then(
                    () => {
                    },
                    (err) => err.response.json().then(({errors}) => {
                        this.setState({errors, loading: false})
                    })
                );
        }, 200);

        const {match} = this.props;
        console.log(this.props);
        console.log(match.params.id);
        if (match.params.id) {  //所有路由的id参
            this.props.fetchAllWebResource(match.params.id);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            resourceId: nextProps.allWebResource.resourceId,
            headline: nextProps.allWebResource.headline,
            coverUrl: nextProps.allWebResource.coverUrl,
            readPrice: nextProps.allWebResource.readPrice,
            owner: nextProps.allWebResource.owner,
            ownershipPrice: nextProps.allWebResource.ownershipPrice,
            readCount: nextProps.allWebResource.readCount,
            liked: nextProps.allWebResource.liked,
            file: nextProps.allWebResource.file
        });
    }

    changeFiles = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        this.setState({file: file});
    };

    handleChange = (e) => {
        if (!!this.state.errors[e.target.name]) {
            let errors = Object.assign({}, this.state.errors);  //clone
            delete errors[e.target.name];
            this.setState({
                [e.target.name]: e.target.value,
                errors
            })
        } else {
            this.setState({[e.target.name]: e.target.value})
        }
    };

    handleSubmit_1 = (e) => {
        e.preventDefault();
        console.log(this.state);

    };

    handleSubmit_2 = (e) => {
        e.preventDefault();
        console.log(this.state);

        console.log('Transaction_2');
        const userBalance = this.props.localUser.balance;
        const ownerPrice = this.state.ownershipPrice;
        const userBuyId = 'A' + '-' + this.props.userLogin.user.username;
        //const userId = this.state.userId;
        console.log(userBuyId);

        //同步获取区块链用户信息
        const owner = this.props.allWebResource.owner;
        console.log(owner);
        const userId = owner.slice(35);  //截取到用户ID
        console.log(userId);

        //更新区块链上购买信息
        const $class = "org.demo.network.BuyOwnershipTransaction";
        const resource = "resource:org.demo.network.Resource#" + this.state.resourceId;
        const buyer = "resource:org.demo.network.Customer#" + userBuyId;

        //获取

        this.props.fetchBlockUser(userId).then(
            () => {
                this.setState({succeed: true})
            },
            (err) => err.response.json().then(({errors}) => {
                this.setState({errors, loading: false})
            })
        );

        setTimeout(() => {
            if (this.state.succeed) {
            }

            if (userBuyId !== userId) {
                if (userBalance > ownerPrice) {
                    console.log('余额充足');
                    //区块链上的所有权交易
                    this.props.updateBlockToken({
                        $class, resource, buyer
                    }).then(
                        () => {
                            this.props.history.push('/resources')
                        },
                        (err) => err.response.json().then(({errors}) => {
                            this.setState({errors, loading: false})
                        })
                    );

                    //本地数据库同步更新
                    const restBalance = userBalance - ownerPrice;
                    console.log(restBalance, userBuyId, userId);

                    //购买用户减去相应的金额
                    this.props.userSubBalance({
                        userBuyId,
                        restBalance
                    }).then(
                        () => {
                        },
                        (err) => err.response.json().then(({errors}) => {
                            this.setState({errors, loading: false})
                        })
                    );

                    const ownerBalance = this.props.owner.balance;
                    console.log(userBalance, ownerPrice, ownerBalance);
                    const totalBalance = ownerBalance + ownerPrice;
                    console.log(totalBalance);

                    //资源拥有者增加相应的金额
                    this.props.userAddBalance({
                        userId,
                        totalBalance
                    });

                    //修改资源所属id
                    const {id, fileTitle} = this.state;
                    this.props.updateResourceInfo({
                        id,
                        userId,
                        fileTitle,
                        userBuyId
                    });


                } else {
                    window.alert("账户余额不足，请充值！");
                    this.props.history.push('/myWallet');
                }
            } else {
                window.alert("这是您自己上传的资源，无需购买！");
            }

        }, 400);

    };

    render() {
        const form = (
            <div className="resouceform-container">
                <div className="header">
                    <h1 className="filetitle">{this.state.headline}</h1>
                </div>

                <div className="ui items">
                    <div className="item">
                        <div className="ui large image resource-image">
                            <img src={this.state.coverUrl} alt="resource Cover"/>
                        </div>
                        <br/>
                        <div className="content">
                            <br/> <br/>
                            <div className="body-content">
                                <div className="description">
                                    <h3>Description:This is the fileDescription</h3>
                                </div>
                                <br/> <br/>
                                <div className="extra">
                                <span className="pricetag">
                                    ReadPrice：{this.state.readPrice}
                                    <button onClick={this.handleSubmit_1}
                                            className="ui teal right floated basic button buy-button"><i
                                        className="shop icon"></i>Buy</button>
                                </span>
                                    <br/><br/>
                                    <span className="pricetag">
                                    RightPrice：{this.state.ownershipPrice}
                                        <button onClick={this.handleSubmit_2}
                                                className="ui teal right floated basic button buy-button"><i
                                            className="shop icon"></i>Buy</button>
                                </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );

        return (
            <div>
                {this.state.done ? <Redirect to="/allWebResources"/> : form}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const {match} = props;
    if (match.params.id) {
        console.log('match', match);
        return {
            allWebResource: state.allWebResources.find(item => item.resourceId.toString() === match.params.id),
            userLogin: state.userLogin,
            blockUser: state.blockUser,
            localUser: state.localUser
        };
    }

    return {
        userLogin: state.userLogin,
        blockUser: state.blockUser,
        localUser: state.localUser,
        allWebResource: null
    };
};

export default connect(mapStateToProps, {
    fetchAllWebResource,
    fetchBlockUser,
    fetchBalance,
    updateBlockToken
})(ResourceTxPage);