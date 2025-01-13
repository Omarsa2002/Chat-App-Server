const userDetailsQuery = (userId)=>{
    return[
        {
            $match: {
                userId: userId
            }
        },
        {
            $facet: {
                userDetails: [
                    {
                        $project: {
                            _id: 0,
                            userId: 1,
                            userName: 1,
                            email: 1,
                            phone: 1,
                            role: 1
                        }
                    }
                ],
                friends: [
                    { $unwind: "$friends" },
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
                        $group: {
                            _id: null,
                            friends: {
                                $push: {
                                    friendId: "$friendDetails.userId",
                                    friendName: "$friendDetails.userName",
                                    chatId: "$friends.chatId"
                                }
                            }
                        }
                    }
                ],
                friendsRequests: [
                    { $unwind: "$friendsRequests" },
                    {
                        $lookup: {
                            from: "friendrequests",
                            localField: "friendsRequests.requestId",
                            foreignField: "requestId",
                            as: "friendRequestDetails"
                        }
                    },
                    { $unwind: "$friendRequestDetails" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "friendRequestDetails.from",
                            foreignField: "userId",
                            as: "requesterDetails"
                        }
                    },
                    { $unwind: "$requesterDetails" },
                    {
                        $match: {
                            "requesterDetails.userId": { $ne: userId }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            friendsRequests: {
                                $push: {
                                    requestId: "$friendRequestDetails.requestId",
                                    requesterId: "$requesterDetails.userId",
                                    requesterName: "$requesterDetails.userName",
                                    status: "$friendRequestDetails.status"
                                }
                            }
                        }
                    }
                ],
                requestsFromMe: [
                    { $unwind: "$friendsRequests" },
                    {
                        $lookup: {
                            from: "friendrequests",
                            localField: "friendsRequests.requestId",
                            foreignField: "requestId",
                            as: "requestFromMeDetails"
                        }
                    },
                    { $unwind: "$requestFromMeDetails" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "requestFromMeDetails.to",
                            foreignField: "userId",
                            as: "toUserDetails"
                        }
                    },
                    { $unwind: "$toUserDetails" },
                    {
                        $match: {
                            "requestFromMeDetails.from": userId
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            requestsFromMe: {
                                $push: {
                                    requestId: "$requestFromMeDetails.requestId",
                                    recipientId: "$toUserDetails.userId",
                                    recipientName: "$toUserDetails.userName",
                                    status: "$requestFromMeDetails.status"
                                }
                            }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                userDetails: { $arrayElemAt: ["$userDetails", 0] },
                friends: { $arrayElemAt: ["$friends.friends", 0] },
                friendsCount: { $size: { $ifNull: ["$friends.friends", []] } },
                friendsRequests: { $arrayElemAt: ["$friendsRequests.friendsRequests", 0] },
                friendsRequestsCount: { $size: { $ifNull: ["$friendsRequests.friendsRequests", []] } },
                requestsFromMe: { $arrayElemAt: ["$requestsFromMe.requestsFromMe", 0] },
                requestsFromMeCont: { $size: { $ifNull: ["$requestsFromMe.requestsFromMe", []] } },
            }
        }
    ]
}


module.exports = {
    userDetailsQuery
}