import React, {Component} from 'react';
// import classnames from 'classnames';
import {connect} from 'react-redux';
import {fetchLocationResource} from '../../actions/locationResourceActions';
import {
    fetchBalance,
    userAddBalance,
    userSubBalance,
    fetchOwnerBalance,
    updateResourceInfo
} from "../../actions/rechargeAction";
import {Redirect} from "react-router-dom";
import './ResourceForm.css';

class ResourceForm extends Component {
    state = {
        id: this.props.testResources ? this.props.testResources.id : '',
        userId: this.props.testResources ? this.props.testResources.userId : '',
        fileTitle: this.props.testResources ? this.props.testResources.fileTitle : '',
        fileImage: this.props.testResources ? this.props.testResources.fileImage : '',
        fileDescription: this.props.testResources ? this.props.testResources.fileDescription : '',
        fileReadPrice: this.props.testResources ? this.props.testResources.fileReadPrice : '',
        fileRightPrice: this.props.testResources ? this.props.testResources.fileRightPrice : '',
        file: this.props.testResources ? this.props.testResources.file : '',
        balance: this.props.user ? this.props.user.balance : '',
        errors: {},
        loading: false,
        done: false
    };

    componentDidMount() {
        const {match, testResources} = this.props;
        if (match.params.id) {  //所有路由的id参数
            this.props.fetchLocationResource(match.params.id);
        }
        const {user} = this.props.userLogin;
        console.log("userId", user);
        //获取购买者的余额
        this.props.fetchBalance(user.id);
        //获取资源所有者的余额
        this.props.fetchOwnerBalance(testResources.userId);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            id: nextProps.testResources.id,
            userId: nextProps.testResources.userId,
            fileTitle: nextProps.testResources.fileTitle,
            fileImage: nextProps.testResources.fileImage,
            fileDescription: nextProps.testResources.fileDescription,
            fileReadPrice: nextProps.testResources.fileReadPrice,
            fileRightPrice: nextProps.testResources.fileRightPrice,
            file: nextProps.testResources.file,
            balance: nextProps.balance
        })
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

    //阅读权的交易
    handleSubmit_1 = (e) => {
        e.preventDefault();

        console.log('Transaction_1');
        const userBalance = this.props.user.balance;
        const readPrice = this.state.fileReadPrice >> 0;
        const userBuyId = this.props.userLogin.user.id;
        const userId = this.state.userId;

        if (userBuyId !== userId) {
            if (userBalance > readPrice) {
                console.log("账户余额充足");
                const restBalance = userBalance - readPrice;
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
                console.log(userBalance, readPrice, ownerBalance);
                const totalBalance = ownerBalance + readPrice;
                console.log(totalBalance);
                //资源拥有者增加相应的金额
                this.props.userAddBalance({
                    userId,
                    totalBalance
                });

                this.props.history.push('/resources')

            } else {
                window.alert("账户余额不足，请充值！");
                this.props.history.push('/myWallet');
            }

        } else {
            window.alert("这是您自己上传的资源，无需购买！");
        }

    };

    //所有权交易
    handleSubmit_2 = (e) => {
        e.preventDefault();

        console.log('Transaction_2');
        const userBalance = this.props.user.balance;
        const ownerPrice = this.state.fileRightPrice >> 0;
        const userBuyId = this.props.userLogin.user.id;
        const userId = this.state.userId;

        if (userBuyId !== userId) {
            if (userBalance > ownerPrice) {
                console.log("账户余额充足");
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

                this.props.history.push('/resources')

            } else {
                window.alert("账户余额不足，请充值！");
                this.props.history.push('/myWallet');
            }


        } else {
            window.alert("这是您自己上传的资源，无需购买！");
        }
    };

    render() {
        const form = (
            <div className="resouceform-container">
                <div className="header">
                    <h1 className="filetitle">{this.state.fileTitle}</h1>
                </div>

                <div className="ui items">
                    <div className="item">
                        <div className="ui large image resource-image">
                            <img src={this.state.fileImage} alt="resource Cover"/>
                        </div>
                        <br/>
                        <div className="content">
                            <br/> <br/>
                            <div className="body-content">
                                <div className="description">
                                    <h3>Description:{this.state.fileDescription}</h3>
                                </div>
                                <br/> <br/>
                                <div className="extra">
                                        <span className="pricetag">
                                            ReadPrice：{this.state.fileReadPrice}
                                            <button className="ui teal right floated basic button buy-button"
                                                    onClick={this.handleSubmit_1}>
                                                <i className="shop icon"></i>Buy</button>
                                        </span>
                                    <br/><br/>
                                    <span className="pricetag">
                                            RightPrice：{this.state.fileRightPrice}
                                        <button className="ui teal right floated basic button buy-button"
                                                onClick={this.handleSubmit_2}>
                                                <i className="shop icon"></i>Buy</button>
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
                {this.state.done ? <Redirect to="/testResources"/> : form}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const {match} = props;
    if (match.params.id) {
        return {
            user: state.user,
            owner: state.owner,
            userLogin: state.userLogin,
            testResources: state.testResources.find(item => item.id.toString() === match.params.id.toString())
        };
    }

    return {
        user: state.user,
        owner: state.owner,
        userLogin: state.userLogin,
        testResources: null
    };
};

export default connect(mapStateToProps, {
    fetchLocationResource,
    fetchBalance,
    userSubBalance,
    userAddBalance,
    fetchOwnerBalance,
    updateResourceInfo
})(ResourceForm);