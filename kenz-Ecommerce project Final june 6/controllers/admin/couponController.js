const { request } = require('express');
const Coupon=require('../../models/couponModel');

const coupon = async(req,res)=>{
    try {
        const coupon = await Coupon.find();
        res.render('couponmanagement',{coupon})
    } catch (error) {
        console.log(error.message);
    }
}

const LoadaddCoupon=async(req,res)=>{
    try {
        
        res.render('add-coupon');
    } catch (error) {
        console.log(error.message);
    }
}


const addcoupon = async (req, res) => {
    try {
      const {
        couponname,
        code,
        description,
        discountType,
        discountValue,
        expirationDate,
        totalUses,
        perUser,
        minOrderAmount,
        maxDiscountAmount, // Get maxDiscountAmount from request body
      } = req.body;
  
      const existingCoupon = await Coupon.findOne({ code });
  
      if (existingCoupon) {
        return res.render('add-coupon', {
          message: "Coupon code already exists. Please choose a different code.",
        });
      }
  
      if (maxDiscountAmount > 500) {
        return res.render('add-coupon', {
          message: "Max discount amount cannot exceed 500.",
        });
      }
  
      const newCoupon = new Coupon({
        couponname,
        code,
        description,
        type: discountType,
        value: discountValue,
        maxDiscountAmount, // Add maxDiscountAmount to the new coupon
        expirationDate,
        usageLimits: {
          totalUses,
          perUser,
        },
        conditions: {
          minOrderAmount,
        },
      });
  
      const savedCoupon = await newCoupon.save();
      res.redirect('/admin/loadcoupon');
    } catch (error) {
      console.log(error.message);
      res.status(500).render('add-coupon', { message: 'An error occurred while adding the coupon.' });
    }
  };
  

const loadeditCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return res.status(404).send('Coupon not found');
        }
        res.render('edit-coupon', { coupon });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const editCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        const { couponname,code, discountType, discountValue, expirationDate, totalUses, perUser, minOrderAmount, description } = req.body;

        const existingCoupon = await Coupon.findOne({ code, _id: { $ne: couponId } });
        if (existingCoupon) {
            return res.render('edit-coupon', {
                message: 'Coupon code already exists. Please choose a different code.',
                coupon: {
                    _id: couponId,
                    couponname,
                    code,
                    discountType,
                    discountValue,
                    expirationDate,
                    totalUses,
                    perUser,
                    minOrderAmount,
                    description
                }
            });
        }




        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            {
                couponname,
                code,
                type: discountType, // Mapping form field to schema field
                value: discountValue, // Mapping form field to schema field
                discountValue,
                expirationDate,
                usageLimits: {
                    totalUses,
                    perUser,
                },
                conditions: {
                    minOrderAmount,
                },
                description,
            },
            { new: true } 
        );

        if (!updatedCoupon) {
            return res.status(404).send('Coupon not found');
        }

        res.redirect('/admin/loadcoupon');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const deleteCoupon=async (req,res)=>{
    try {
        await Coupon.findByIdAndDelete(req.params.couponId);
        res.redirect('/admin/loadcoupon');
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {

    coupon,
    LoadaddCoupon,
    addcoupon,
    loadeditCoupon,
    editCoupon,
    deleteCoupon
}