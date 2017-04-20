const assert = require('assert')
    , tsml   = require('./')


assert.equal(
    tsml`this is a string`
  , 'this is a string'
)


assert.equal(
    tsml`

      this
      is
      a
      string

    `
  , 'thisisastring'

)


assert.equal(
    tsml`

      this 
      is 
      a 
      string 

    `
  , 'this is a string '

)


assert.equal(
    tsml`

      this ${1} 
      is 
      ${2} a 
      string 
      ${true} 
      ${1 + 2}
    `
  , 'this 1 is 2 a string true 3'
)


assert.equal(
    tsml`

      this ${1} 
    is 
  ${2} a 
string 
  ${true} 
    ${1 + 2}
`
  , 'this 1 is 2 a string true 3'
)
