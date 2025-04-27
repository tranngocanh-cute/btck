'use-strict'
const _ = require('lodash')

const getInfoData = ({fileds = [], object = {} }) => {
    return _.pick (object, fileds)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((item) => [item, 1]))
}
const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map((item) => [item, 0]))
}

const removeUndefindObject = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return {}
    }
    Object.keys(obj).forEach(k => {
      if (obj[k] == null) {
        delete obj[k]
      }
    })
    return obj
  }

  const updateNestedObjectParser = (obj) => {
    // Nếu obj null/undefined thì trả về object rỗng
    if (!obj || typeof obj !== 'object') {
      return {}
    }
  
    const final = {}
    Object.keys(obj).forEach((k) => {
      // Nếu là object lồng nhau thì đệ quy
      if (typeof obj[k] === 'object' && !Array.isArray(obj[k]) && obj[k] !== null) {
        const response = updateNestedObjectParser(obj[k])
        Object.keys(response).forEach((a) => {
          // Sửa 'res[a]' thành 'response[a]'
          final[`${k}.${a}`] = response[a]
        })
      } else {
        final[k] = obj[k]
      }
    })
    return final
  }

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefindObject,
    updateNestedObjectParser
}