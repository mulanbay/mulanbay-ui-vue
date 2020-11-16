import request from '@/utils/request'

export function deleteAccountSnapshotInfo(id) {
  const data = {
      id
  }
  return request({
    url: '/accountSnapshotInfo/delete',
    method: 'post',
    data
  })
}

export function getAccountSnapshotInfoTree(query) {
  return request({
    url: '/accountSnapshotInfo/getSnapshotInfoTree',
    method: 'get',
    params:query
  })
}
