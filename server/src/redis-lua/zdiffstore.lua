-- returns items only existing in first Sorted Set
-- zdiffstore DESTIONATION key [key ...]

local destination = KEYS[1]
local diffSet = KEYS[2]

redis.call('zunionstore', destination, 1, diffSet)

local i = 3
while i <= #KEYS do
  local data = redis.call('zrange', KEYS[i], 0, -1)

  for j, member in pairs(data) do
    redis.call('zrem', destination, member)
  end

  i = i + 1
end

return redis.call('zcard', destination)
