


const details=async (req,res)=>
    {
        try{
            return await res.status(200).json("from backend side")
        }
        catch(err){
            res.status(500).json({
                message: err.message || "Some error occurred while retrieving"
            })
        }
    }

    module.exports= {
        details
    }