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
            }
        },
        {
            $project: {
                userDetails:{$arrayElemAt:["$userDetails",0]},
                friendsDetails:{$arrayElemAt:["$friends.friends",0]},
                friendsCount:{$size:{$arrayElemAt:["$friends.friends",0]}},
                friendsRequestsDetails:{$arrayElemAt:["$friendsRequests.friendsRequests",0]},
                friendsRequestsCount:{$size:{$arrayElemAt:["$friendsRequests.friendsRequests",0]}}
            }
        }
    ]
}


module.exports = {
    userDetailsQuery
}