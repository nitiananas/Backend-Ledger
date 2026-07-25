const mongoose=require('mongoose');


const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Ledger must be associated with an account "],
        index:true,
        immutable:true,
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a ledger entry"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Types can be either CREDIT or DEBIT",
        },
        required:[true,"Ledger type is required"],
        immutable:true
    }
},{
    timestamps:true
})


function preventLedgeModification(){
    throw new Error("Ledger entries are immutbale and cannot be modified or deleted");
}

ledgerSchema.pre('findOneAndUpdate',preventLedgeModification);
ledgerSchema.pre('updateOne',preventLedgeModification);
ledgerSchema.pre('deleteOne',preventLedgeModification);
ledgerSchema.pre('remove',preventLedgeModification);
ledgerSchema.pre('deleteMany',preventLedgeModification);
ledgerSchema.pre('updateMany',preventLedgeModification);
ledgerSchema.pre('findOneAndDelete',preventLedgeModification);
ledgerSchema.pre("findOneAndReplace", preventLedgeModification);


const ledgerModel=mongoose.model('ledger',ledgerSchema);

module.exports=ledgerModel;