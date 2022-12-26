const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    let { page, limit } = req.query;
    page = +page || +process.env.PAGE;
    limit = +limit || +process.env.LIMIT;
    let skip = (page - 1) * limit;
    let totalDocs = await User.countDocuments();
    let users = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "postData"
        }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          posts: { $size: "$postData" }
        }
      }
    ]);
    let totalPages = Math.ceil(totalDocs/limit)
    res.status(200).json({
      data: {
        users,
        pagination: {
          totalDocs,
          limit,
          page,
          totalPages,
          pagingCounter: totalDocs-users.length,
          hasPrevPage: (page <= 1)?false:true,
          hasNextPage: (totalPages != page)?true:false,
          prevPage: (page > 1)?page-1:null,
          nextPage: totalPages-page
        }
      }
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};
