const mongoose = require('mongoose')
const express = require('express');
require('../models/post')
const router = express.Router();
const Post = mongoose.model("Post");
const requireLogin = require('../middleware/requiredLogin');
const requiredLogin = require('../middleware/requiredLogin');
const User = mongoose.model("User");
// in frontend when we click on a post of a user we want to see all the post 
//that user is  having  so in the backend we will pass the userid who posted 
//that  post and uske coressponding uski sari post return krna

//populate()  lets you reference documents in other collections
router.get('/user/:userId', requireLogin, (req, res) => {
    // console.log("userid")
    User.findOne({ _id: req.params.userId }).select("-password").exec((err, user) => {
        //if we want to hide an entity like the password select("-password") as above so user will not containt the
        //password in the response
        if (!err && user) {
            Post.find({ postedBy: req.params.userId }).populate('postedBy', '_id name').exec((err, data) => {
                if (err) {
                    return res.status(422).send(err)
                }
                else {
                    return res.status(422).send({ user: user, post: data });
                }
            })
        }
        else {
            return res.status(422).send(err);
        }

    })
})
router.put('/follow', requireLogin, (req, res) => {
    //one more thing u can do here is after the first query within that same
    //functon u can give a callback funciton wiht the ar(err,result) and can write the other query
    //so here from the frontend we will get the id of the user whom we 
    //wanted to follow and heir in the backend we will update the 
    //follower array of that user with the logged in user and also 
    //following array of the logged in user with the foolow id 
    //findOneAndUpdate(filter,update u wna do,if u want the updated doc put new as true)
    User.findOneAndUpdate({ _id: req.body.followId }, {
        $push: { followers: req.user._id }
    },
        {
            new: true
        }).select('-password').exec((err, followerUpdate) => {
            if (err) {
                return res.status(422).send(err);
            }
            else {
                User.findOneAndUpdate({ _id: req.user._id }, {
                    $push: { following: req.body.followId }
                },
                    {
                        new: true
                    }).select('-password').exec((err, followingUpdate) => {
                        if (err) {
                            return res.status(422).send(err);
                        }
                        else {
                            return res.send({ followerUpdate, followingUpdate })
                        }
                    })
            }
        })

})
router.put('/unfollow', requireLogin, (req, res) => {
       User.findOneAndUpdate({ _id: req.body. unfollowId }, {
        $pull: { followers: req.user._id }
    },
        {
            new: true
        }).select('-password').exec((err, followerUpdate) => {
            if (err) {
                return res.status(422).send(err);
            }
            else {
                User.findOneAndUpdate({ _id: req.user._id }, {
                    $pull: { following: req.body. unfollowId }
                },
                    {
                        new: true
                    }).select('-password').exec((err, followingUpdate) => {
                        if (err) {
                            return res.status(422).send(err);
                        }
                        else {
                            return res.send({ followerUpdate, followingUpdate })
                        }
                    })
            }
        })

})
router.put('/updateprofile',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        url:req.body.url
    },{
        new:true
    }).select('-password').exec((err,result)=>{
        if(result){
            res.send(result);
        }
        else{
            console.log(err);
            res.status(422).send({error:"pic cannot be posted"});
        }
    })



})
module.exports = router
//the user will be able to view the profile of other user

