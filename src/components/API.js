export const config = {
    baseUrl: "https://beta.cloudos.com:10248",
    wwwUrl: "https://local.cloudos.com:3002",
    timeout: 3000,
    api: {
        userinfo: {
            detail: "/userinfo/detail",
        },
        homework: {
            list: '/homework/list',
        },
        cloudclass: {
            list: '/cloudclass/list',
            start: '/cloudclass/start',
            end: '/cloudclass/end',
            practiceList: '/cloudclass/practiceList',
            connectionList: '/cloudclass/connectionList',
        },
        practice: {
            start: '/practice/start',
            submit: '/practice/submit',
            comment: '/practice/comment',
            acquireConnect: '/practice/acquireConnect',
            agreeConnect: '/practice/agreeConnect',
        }
    },
};
export let _UserInfo;
export const getUserInfo = () => {
    return _UserInfo;
};

export function isSuccess(response) {
    return response.code === 1001 && response.data != null;
};
export const checkApiData = (data) => {
    if (isSuccess(data)) {
        console.log('api success data: ', data.data);
        if (_UserInfo && _UserInfo.balance && typeof data.data.balance == 'number') {
            _UserInfo.balance = data.data.balance;
        }
        return Promise.resolve(data.data);
    } else {
        console.warn('api error', data);
        if (data.code === 2002) {
            data.router = "Login";
        }
        return Promise.reject(data);
    }
};
const errorHandler = (error) => {
    console.error(error);
};

import axios from "axios";
export const requestAPI = async (method, url, params) => {
    console.warn({ method, url, params });
    if (method === "get") {
        for (let i in params) {
            if (params[i] === undefined) {
                delete params[i];
            }
        }
        params = new URLSearchParams(params);
        url += "?" + params.toString();
        params = {};
    }
    try {
        const data = await axios.request({
            method: method,
            baseURL: config.baseUrl + url,
            data: params,
            timeout: config.timeout,
        });
        return data.data;
    } catch (error) {
        console.log("error", error.message);
    }
    return null;
};
export const isLogin = () => {
    return !!(axios.defaults.headers.common["Authorization"] && _UserInfo != null);
};
export const setToken = (token) => {
    axios.defaults.headers.common["Authorization"] = token;
    return api.userinfo.detail();
};
export const api = {
    userinfo: {
        detail: () => {
            return requestAPI("get", config.api.userinfo.detail).then(checkApiData);
        }
    },
    homework: {
        list: () => {
            return requestAPI("get", config.api.homework.list).then(checkApiData);
        }
    },
    cloudclass: {
        list: ({ homeworkId }) => {
            return requestAPI("get", config.api.cloudclass.list, { homeworkId }).then(checkApiData);
        },
        start: ({ cloudClassId }) => {
            return requestAPI("post", config.api.cloudclass.start, { cloudClassId }).then(checkApiData);
        },
        end: ({ cloudClassId }) => {
            return requestAPI("post", config.api.cloudclass.end, { cloudClassId }).then(checkApiData);
        },
        practiceList: ({ pageSize, pageIndex, status, cloudClassId }) => {
            return requestAPI('get', config.api.cloudclass.practiceList, { pageSize, pageIndex, status, cloudClassId }).then(checkApiData);
        },
        connectionList: ({ pageSize, pageIndex, status, cloudClassId }) => {
            return requestAPI("get", config.api.cloudclass.connectionList, { pageSize, pageIndex, status, cloudClassId }).then(checkApiData);
        }
    },
    practice: {
        join: ({ cloudClassId }) => {
            return requestAPI("post", config.api.practice.start, { cloudClassId }).then(checkApiData);
        },
        submit: ({ practiceId }) => {
            return requestAPI("post", config.api.practice.submit, { practiceId }).then(checkApiData);
        },
        comment: ({practiceId, comment}) => {
            return requestAPI("post", config.api.practice.comment, {practiceId, comment}).then(checkApiData);
        },
        acquireConnect: ({ practiceId }) => {
            return requestAPI("post", config.api.practice.acquireConnect, { practiceId }).then(checkApiData);
        },
        agreeConnect: ({ practiceId }) => {
            return requestAPI("post", config.api.practice.agreeConnect, { practiceId }).then(checkApiData);
        }
    }
};

// http://localhost:3001/login?uid=kongkang
export const isApiLogin = async () => {
    return api.userinfo.detail().then(data => {
        console.log(data);
        _UserInfo = data;
        return true;
    }, error => {
        console.warn(error);
        return false;
    }).catch(console.error);
};