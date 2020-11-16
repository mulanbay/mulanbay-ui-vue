import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/musicInstrument/getData',
    method: 'get',
    params: query
  })
}

export function changeMusicInstrumentStatus(id,status) {
  const data = {
      id,
      status
  }
  return request({
    url: '/musicInstrument/changeStatus',
    method: 'post',
    params: data
  })
}


export function getMusicInstrument(id) {
  return request({
    url: '/musicInstrument/get',
    method: 'get',
    params: { id }
  })
}

export function getMusicInstrumentTree(needRoot) {
  return request({
    url: '/musicInstrument/getMusicInstrumentTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createMusicInstrument(data) {
  return request({
    url: '/musicInstrument/create',
    method: 'post',
    data
  })
}

export function updateMusicInstrument(data) {
  return request({
    url: '/musicInstrument/edit',
    method: 'post',
    data
  })
}
export function deleteMusicInstrument(ids) {
  const data = {
      ids
  }
  return request({
    url: '/musicInstrument/delete',
    method: 'post',
    data
  })
}
