<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历标题" prop="title">
            <el-input v-model="form.title" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历内容" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="日历时间" prop="bussDay">
            <el-date-picker type="datetime" v-model="form.bussDay" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注内容">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

  </div>
</template>

<script>
  import {getUserCalendarBySource,createUserCalendar,editUserCalendar} from "@/api/data/userCalendar";
  import {aiMatch} from "@/api/consume/goodsLifetime";
  import {getBuyRecord} from "@/api/consume/buyRecord";
  import {getDayByDate} from "@/utils/datetime";

export default {
  name: "BuyRecordLifetimeCalendar",
  props: {
      //父层带过来的信息值
      buyRecordData: {id:undefined}
  },
  data() {
    return {
      // 表单参数
      form: {
        id:undefined
      },
      // 表单校验
      rules: {
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "内容不能为空", trigger: "blur" }
        ],
        bussDay: [
          { required: true, message: "开始时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.buyRecordData);
  },
  //监听父层带过来的账户信息值
  watch:{
    buyRecordData: {
      deep: true,
      handler(val) {
        this.buyRecordData =val;
        this.handleReceiveData(this.buyRecordData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.reset();
      this.loadBuyRecord(data.id);
    },
    //加载明细
    loadBuyRecord(id){
      if(id==undefined|| id==null){
        return;
      }
      getUserCalendarBySource('BUY_RECORD',id).then(response => {
        if(response!=null){
          this.form = response;
        }else{
          this.getFromBuyRecord(id);
        }
      });
    },
    getFromBuyRecord(id){
      getBuyRecord(id).then(response => {
        this.form.content = '['+response.goodsName+']商品到了使用寿命,请及时处理.处理后并在消费管理页面填写售出时间';
        this.form.sourceId = id;
        aiMatch(response.goodsName).then(matchRes => {
          if(matchRes!=null){
            const days = matchRes.days;
            this.form.bussDay = getDayByDate(days,response.buyDate)+' 00:00:00';
            this.form.remark = '匹配商品分类:'+matchRes.name+',默认有效时长:'+days+'天';
          }
        });
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        title:'商品过期处理',
        content:undefined,
        bussDay:undefined,
        bussIdentityKey: 'buyRecord_'+(new Date().Format("yyyyMMddhhmmss")),
        sourceType: 'BUY_RECORD',
        allDay:true,
        period:'ONCE',
        remark:undefined
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
      this.form.expireTime = this.form.bussDay;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            editUserCalendar(this.form).then(response => {
              this.msgSuccess("修改成功");
            });
          } else {
            createUserCalendar(this.form).then(response => {
              this.msgSuccess("新增成功");
            });
          }
          this.$emit('closeMe');
        }
      });
    }
  }
};
</script>
