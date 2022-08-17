export const config = {
    baseUrl: "https://beta.cloudos.com:10248",
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
        },
        practice: {
            start: '/practice/start',
        }
    },
};

export function isSuccess(response) {
    return response.code === 1001 && response.data != null;
};
export const checkApiData = (data) => {
    if (isSuccess(data)) {
        console.log('api success data: ', data.data);
        return Promise.resolve(data.data);
    } else {
        console.warn('api error', data);
        if (data.code === 2002) {
            // window.location.href = '/login';
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
    return !!axios.defaults.headers.common["Authorization"];
};
export const setToken = (token) => {
    axios.defaults.headers.common["Authorization"] = token;
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
    },
    practice: {
        join: ({ cloudClassId }) => {
            return requestAPI("post", config.api.practice.start, { cloudClassId }).then(checkApiData);
        }
    }
};