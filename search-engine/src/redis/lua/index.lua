-- indexes a item or updates if already existing
-- index itemID numProperties property value [property value ...] numConditions property condition value [property condition value ...] numTokenProperties tokenProperty numTokens token [token ...] [tokenProperty numTokens token [token ...] ...x]
-- condition can either be LESS, GREATER, EQUAL or NOTEQUAL


local rawItemHash = 'rawItem:' + ARGV[1]
local numProperties = ARGV[2]

local numConditionsOffset = 2 + (numProperties * 2) + 1
local conditionsOffset = numConditionsOffset + 1
local numConditions = ARGV[numConditionsOffset]

local numTokensOffset = conditionsOffset + (numConditions * 3) + 1
local tokensOffset = numTokensOffset + 1
local numTokenProperties = ARGV[numTokensOffset]


-- check if all conditions apply, if not then return false
for i = 0, numConditions do
  local property = ARGV[conditionsOffset + (i * 3)]
  local condition = ARGV[conditionsOffset + (i * 3) + 1]
  local value = ARGV[conditionsOffset + (i * 3) + 2]

  local existingValue = redis.call('hget', rawItemHash, property)

  if condition == 'LESS' then
    if not existingValue < value then return false end
  elseif condition == 'GREATER' then
    if not existingValue > value then return false end
  elseif condition == 'EQUAL' then
    if not existingValue == value then return false end
  elseif condition == 'NOTEQUAL' then
    if not existingValue ~= value then return false end
  end
end

-- remove all existing tokens
