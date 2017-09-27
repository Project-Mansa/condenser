import {List, Map, OrderedMap} from 'immutable';
import tt from 'counterpart';

const defaultState = Map({
    requests: {},
    loading: false,
    error: '',
    location: {},
    notifications: null,
    ignoredLoadingRequestCount: 0,
    notificounters: Map({
        total: 0,
        feed: 0,
        reward: 0,
        send: 0,
        mention: 0,
        follow: 0,
        vote: 0,
        reply: 0,
        account_update: 0,
        message: 0,
        receive: 0
    })
});

export default function reducer(state = defaultState, action) {
    if (action.type === '@@router/LOCATION_CHANGE') {
        return state.set('location', {pathname: action.payload.pathname});
    }
    if (action.type === 'STEEM_API_ERROR') {
        return state.set('error', action.error).set('loading', false);
    }
    let res = state;
    if (action.type === 'FETCH_DATA_BEGIN') {
        res = state.set('loading', true);
    }
    if (action.type === 'FETCH_DATA_END') {
        res = state.set('loading', false);
    }

    //Todo: for dev only! Do not merge if present - probably belongs in a different place
    if (action.type === 'yotification_markRead') {
        const yotifications = state.getIn(['yotifications']);
        const notifications = (yotifications && yotifications.size > 0)? yotifications.toJS() : [];
        notifications.forEach((n) => {
            if(n.id === action.id) {
                n.read = true;
            }
        })
        return state.set('yotifications', List(notifications));
    }
    //Todo: for dev only! Do not merge if present - probably belongs in a different place
    if (action.type === 'yotification_markAllRead') {
        const yotifications = state.getIn(['yotifications']);
        const notifications = (yotifications && yotifications.size > 0)? yotifications.toJS() : [];
        notifications.forEach((n) => {
            n.read = true;
        })
        return state.set('yotifications', List(notifications));
    }

    //Original verions of notifications code
    if (action.type === 'ADD_NOTIFICATION') {
        const n = {
            action: tt('g.dismiss'),
            dismissAfter: 10000,
            ...action.payload
        };
        res = res.update('notifications', s => {
            return s ? s.set(n.key, n) : OrderedMap({[n.key]: n});
        });
    }
    if (action.type === 'REMOVE_NOTIFICATION') {
        res = res.update('notifications', s => s.delete(action.payload.key));
    }
    if (action.type === 'UPDATE_NOTIFICOUNTERS' && action.payload) {
        const nc = action.payload;
        if (nc.follow > 0) {
            nc.total -= nc.follow;
            nc.follow = 0;
        }
        res = res.set('notificounters', Map(nc));
    }
    return res;
}
