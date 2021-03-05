<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="用药时间" prop="occurTime">
          <el-date-picker type="datetime" v-model="form.occurTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                    :style="{width: '100%'}" placeholder="请选择时间" clearable >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="submitForm">保 存</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
  </div>
</template>

<script>
  import {getTreatDrugDetail,createTreatDrugDetail,updateTreatDrugDetail} from "@/api/health/treat/treatDrugDetail";
  import {getNowDateTimeString} from "@/utils/datetime";

export default {
  name: "Detail",
  props: {
      //父层带过来的信息值
      treatForDrugDetailData:{
        id:undefined,
        treatDrugId:undefined,
        occurTime:undefined
      },
  },
  data() {
    return {
      loading:false,
      // 表单参数
      form: {
        id:undefined,
        treatDrugId:undefined,
        occurTime:undefined
      },
      // 表单校验
      rules: {
        occurTime: [
          { required: true, message: "用药时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.treatForDrugDetailData);
  },
  //监听父层带过来的账户信息值
  watch:{
    treatForDrugDetailData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.reset();
      this.form.id=data.id;
      this.form.treatDrugId=data.treatDrugId;
      this.form.occurTime = data.occurTime;
      this.loadTreatDrugDetail(this.form.id);
      //console.log("receive data:"+JSON.stringify(this.form));
    },
    //加载明细
    loadTreatDrugDetail(id){
      if(id==undefined|| id==null){
        return;
      }
      //加载详情
      getTreatDrugDetail(id).then(response => {
        this.form = response;
        this.form.treatDrugId = response.treatDrug.id;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        occurTime:getNowDateTimeString()
      };
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      //调用父组件的方法来关闭子组件
      this.$emit('closeMe');
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateTreatDrugDetail(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.$emit('closeMe');
              this.$emit('refreshList');
            });
          } else {
            createTreatDrugDetail(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.$emit('closeMe');
              this.$emit('refreshList');
            });
          }
        }
      });
    }
  }
};
</script>
