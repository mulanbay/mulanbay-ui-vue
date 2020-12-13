<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="选择关联预算" prop="budgetId">
          <treeselect
            v-model="form.budgetId"
            :options="budgetOptions"
            :disable-branch-nodes="true"
            :show-count="true"
            placeholder="请选择预算" />
        </el-form-item>
        <el-form-item label="实际消费金额" prop="amount">
          <el-input-number v-model="form.amount" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>
        </el-form-item>
        <el-form-item label="实际发生时间" prop="occurDate">
              <el-date-picker type="datetime" v-model="form.occurDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                         placeholder="请选择时间" clearable :style="{width: '200px'}" >
              </el-date-picker>
        </el-form-item>
        <el-form-item label="预算备注信息">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>

  </div>
</template>

<script>
  import {getBudgetTree} from "@/api/fund/budget";
  import {createBudgetLog,updateBudgetLog,getBudgetLog} from "@/api/fund/budgetLog";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Detail",
  components: { Treeselect },
  props: {
      //父层带过来的值(id:不为空表示为修改，budgetId不为空表示为新增)
      budgetData: {
        budgetId: undefined,
        id:undefined
      }
  },
  data() {
    return {
      //预算列表
      budgetOptions:[],
      // 表单参数
      form: {
        id:undefined,
        budgetId:undefined,
        amount:undefined,
        remark:undefined
      },
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        budgetId: [
          { required: true, message: "预算不能为空", trigger: "blur" }
        ],
        amount: [
          { required: true, message: "实际消费金额不能为空", trigger: "blur" }
        ],
        occurDate: [
          { required: true, message: "发生时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.budgetData);
  },
  //监听父层带过来的值
  watch:{
    budgetData(newVal,oldVal){
      this.budgetData = newVal;
      this.handleReceiveData(this.budgetData);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.reset();
      this.getBudgetTreeselect();
      //console.log("watch:"+JSON.stringify(data));
      this.form.budgetId = data.budgetId;
      const id = data.id;
      this.loadBudgetLog(id);
    },
    /** 查询预算下拉树结构 */
    getBudgetTreeselect() {
      getBudgetTree(false,true).then(response => {
        this.budgetOptions = response;
      });
    },
    //加载预算流水明细
    loadBudgetLog(id){
      if(this.isObjectEmpty(id)){
        return;
      }
      getBudgetLog(id).then(response => {
        this.form = response;
        this.form.amount = response.ncAmount;
        if(response.budget!=null){
          this.form.budgetId = response.budget.id;
        }
      });
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        id: undefined,
        amount: undefined,
        occurDate:undefined,
        budgetId:undefined
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
            updateBudgetLog(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.$emit('closeMe');
              this.$emit('refreshList');
            });
          } else {
            createBudgetLog(this.form).then(response => {
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
