import request from '@/utils/request';
import * as qs from 'qs';
// 用户登录
export function signIn(params: object) {
	return request({
		url: '/login',
		method: 'post',
		data: qs.stringify(params),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});
}

// 用户退出登录
export function signOut(params: object) {
	return request({
		url: '/user/signOut',
		method: 'post',
		data: params,
	});
}
