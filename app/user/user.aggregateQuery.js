const userDetailsQuery = (userId)=>{
    return[
        {
            $match: {
                userId: userId
            }, 
        },
        {
            $facet: {
                userDetails: [
                    {
                        $project: {
                            _id: 0,
                            userId:1,
                            userName: 1,
                            email: 1,
                            phone: 1,
                            isOnline:1,
                            role: 1,
                        },
                    },
                ],
                friends:[
                    {$unwind:"$friends"},
                    {
                        $lookup: {
                            from: "users",
                            localField: "friends.userId",
                            foreignField: "userId",
                            as: "friendDetails"
                        }
                    },
                    { $unwind: "$friendDetails" },
                    {
                        $group:{
                            _id:null,
                            friends: {
                                $push: {
                                    friendId: "$friendDetails.userId",
                                    friendName: "$friendDetails.userName",
                                },
                            },
                        },
                    },
                ],
                friendsRequests: [
                    { $unwind: "$friendsRequests" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "friendsRequests.userId",
                            foreignField: "userId",
                            as: "requestDetails",
                        },
                    },
                    { $unwind: "$requestDetails" },
                    {
                        $group: {
                            _id: null,
                            friendsRequests: {
                                $push: {
                                    requestId: "$requestDetails.userId",
                                    requestName: "$requestDetails.userName",
                                },
                            },
                        },
                    },
                ],
                requestedFriends:[
                    { $unwind: "$requestedFriends" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "requestedFriends.userId",
                            foreignField: "userId",
                            as: "requestedFriendsDetails",
                        },
                    },
                    { $unwind: "$requestedFriendsDetails" },
                    {
                        $group: {
                            _id: null,
                            requestedFriends: {
                                $push: {
                                    requestedId: "$requestedFriendsDetails.userId",
                                    requestedName: "$requestedFriendsDetails.userName",
                                },
                            },
                        },
                    },
                ],
            }
        },
        {
            $project: {
                userDetails:{$arrayElemAt:["$userDetails",0]},
                friendsDetails:{$arrayElemAt:["$friends.friends",0]},
                friendsCount: { $size: { $ifNull: ["$friends.friends", []] } },
                friendsRequestsDetails:{$arrayElemAt:["$friendsRequests.friendsRequests",0]},
                friendsRequestsCount: { $size: { $ifNull: ["$friendsRequests.friendsRequests", []] } },
                requestedFriendsDetails:{$arrayElemAt:["$requestedFriends.requestedFriends",0]},
                requestedFriendsCount: { $size: { $ifNull: ["$requestedFriends.requestedFriends", []] } }
            }
        }
    ]
}


module.exports = {
    userDetailsQuery
}