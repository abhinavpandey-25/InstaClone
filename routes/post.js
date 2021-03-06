const mongoose = require('mongoose')
const express = require('express');
require('../models/post')
const router = express.Router();
const Post = mongoose.model("Post");
const requireLogin = require('../middleware/requiredLogin');
const requiredLogin = require('../middleware/requiredLogin');
router.get('/allpost', requireLogin, (req, res) => {
    Post.find({}).populate("postedBy ", "_id name").
        populate("comments.postedBy", "_id name")
        //agar populate nhi hua toh front me acces nhi hoga as wha object id hi h apne pass
        .then(result => {
            res.send(result)
        }).catch(err => {
            console.log(err)
        })
})
//get all the post of the user whom u follow and whom u clicked by sending the id of the user 
//whom u follow and clicked
//or check krenge ki loged in user isko folow krra ki nai agr logged in user k foolowing ary
//m  h ya nai agr h toh uski sari post dikhao else  usko filow krne ko kho
router.get('/getsubpost', requireLogin, (req, res) => {
    Post.find({postedBy:{$in:req.user.following}}).populate("postedBy ", "_id name").
        populate("comments.postedBy", "_id name")
        //agar populate nhi hua toh front me acces nhi hoga as wha object id hi h apne pass
        .then(result => {
            res.send(result)
        }).catch(err => {
            console.log(err)
        })
})
router.post('/createpost', requireLogin, (req, res) => {
    const { title, body, img } = req.body;
    console.log(title)
    console.log(body)
    console.log(img)
    if (!title || !body || !img) {
        return res.status(422).send({ error: "please add all the fields" })
    }

    console.log(req.user);
    req.user.password = undefined;
    const newpost = new Post({
        title: title,
        body: body,
        photo: img,
        postedBy: req.user
    })

    newpost.save().then(result => {
        res.send({ post: result })
        //the point here is that the result also consist of password although
        //encrypted but not safe so don't send paasowrd
    })
        .catch(error => console.log(error))
})
router.get('/mypost', requireLogin, (req, res) => {
    // for viewing mu post  i will go through the authentication
    //then req object will get the user who requrested for viewing his post
    //and coresponding to that id it find from the PostDB by looking 
    //at each post id whther it matches with the userid who want to look 
    //at his post if matches then put in array  and send as response 
    Post.find({ postedBy: req.user._id }).then(mypost => {
        res.send({ mypost })
    }).catch(err => {
        console.log(err)
    })
})
//put is an update request
//and also for liking the post the user must be logged in
router.put('/likes', requireLogin, (req, res) => {
    //har post ki ek id hogi and for liking a post we
    //will require the post id so that us post id k likes 
    //ham store kr sake
    Post.findByIdAndUpdate(req.body.postId, {
        //yha ham logged in user ki id store kra rhe h
        //and wo kam ie req object m logged in user attach krna is done
        //by middlewaree
        $push: { likes: req.user._id }
    }, {
        //since we want mongodb to return newrecord so we need to write true here
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).send({ error: err })
        }
        else {
            return res.send(result)
        }
    })
})
router.put('/dislikes', requireLogin, (req, res) => {
    //har post ki ek id hogi and for liking a post we
    //will require the post id so that us post id k likes 
    //ham store kr sake
    Post.findByIdAndUpdate(req.body.postId, {
        //yha ham logged in user ki id store kra rhe h
        //and wo kam ie req object m logged in user attach krna is done
        //by middlewaree
        $pull: { likes: req.user._id }
        //pull us user id ki sari occurence hta dega
        //aur shi bhi h kyuki ek user ek post ko ek hi bar 
        //like krege toh likes array would consiting of distinct
        //user id's 
    }, {
        //since we want mongodb to return newrecord so we need to write true here
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).send({ error: err })
        }
        else {
            return res.send(result)
        }
    })
})
router.put('/comments', requireLogin, (req, res) => {
    //one more issue after doing the comment stuff ie
    //when we load the page the posted by guy is lossed 
    //that is due to that comments posted by needs to
    //be popoulated at allposst route as on reloding 
    // sari post access ho rhi thi from allpst route this is a backend issue
    const comment = {
        text: req.body.comment,
        //text wii come from frontend
        postedBy: req.user
        //posted by hame middleware se mil jyga as wo 
        //verify hone k bad req object se user atteach krwa dega
    }
    //post kii id front end sse bhjenge
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    },
        {
            new: true
            //taki updated user return ho
        }).populate('comments.postedBy', "_id name")
        .populate('postedBy', "_id name")
        .exec((err, result) => {
            if (err) {
                res.status(422).send({ error: err })
            }
            else {
                res.send(result);
                //result m wo update post(kyuki new true kiya) return hogi jime
                //comment dala hoga recently
            }
        })
})
router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    console.log("delete");
    Post.findByIdAndRemove({ _id: req.params.postId }, (err, result) => {
        if (err) {
            res.status(422).send({ err })
        }
        else {
            res.send(result);
        }
    })
})
//also can be done through sending the  post id through the body
//agar woh post meri hogi toh hi m delete kar skta hu so mujhe
//check krna pdega ki postid.postedby==userid(can be get thorough thr middleware)
router.delete('/comment/:commentID', requiredLogin, (req, res) => {
    //we will get the id of the post whose comment we want to delete
    //and then in that post search for the comment id which we wanna 
    //delete 
    Post.findByIdAndUpdate({ _id: req.body.postId }, {
        $pull: { comments: {_id:req.params.commentID} }
    }, {
        new: true
    }).populate('comments.postedBy', "_id name")
    .populate('postedBy', "_id name")
    .exec((err, data) => {
        if (err) {
            res.status(422).send(err)
        }
        else {
            res.send(data);
        }
    })
})

module.exports = router
