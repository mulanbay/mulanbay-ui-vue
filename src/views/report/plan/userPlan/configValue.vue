<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="计划编号" prop="userPlanId">
        <el-input
          v-model="queryParams.userPlanId"
          disabled
          size="small"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['report:plan:userPlan:configValue:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['report:plan:userPlan:configValue:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:plan:userPlan:configValue:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:plan:userPlan:configValue:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['report:plan:userPlan:configValue:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="configValueList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年份" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.year }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划次数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.planCountValue }}次</span>
        </template>
      </el-table-column>
      <el-table-column label="计划值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.planValue+unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['report:plan:userPlan:configValue:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['report:plan:userPlan:configValue:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="360px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="计划年份" prop="year">
          <el-date-picker
            v-model="form.year"
            type="year"
            format="yyyy"
            value-format="yyyy"
            style="width: 80%"
            placeholder="选择年">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划次数" prop="planCountValue">
         <el-input-number v-model="form.planCountValue" style="width: 80%" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
          次
        </el-form-item>
        <el-form-item label="计划值" prop="planValue">
         <el-input-number v-model="form.planValue" style="width: 80%" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
          {{unit}}
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" style="width: 80%" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,getUserPlanConfigValue,createUserPlanConfigValue,updateUserPlanConfigValue,deleteUserPlanConfigValue} from "@/api/report/plan/userPlanConfigValue";
import {getUserPlan} from "@/api/report/plan/userPlan";

export default {
  name: "ConfigValue",
  props: {
    //父层带过来的账户信息值
    userPlanData:{
      id:undefined
    }
  },
  data() {
    return {
      //单位
      unit:'',
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 列表数据
      configValueList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        userPlanId: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        year: [
          { required: true, message: "年份不能为空", trigger: "blur" }
        ],
        planCountValue: [
          { required: true, message: "计划次数不能为空", trigger: "blur" }
        ],
        planValue: [
          { required: true, message: "计划值不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.userPlanData);
  },
  watch: {
    userPlanData: {
      deep: true,
      handler(val) {
        this.userPlanData =val;
        this.handleReceiveData(this.userPlanData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.userPlanId=data.id;
      this.getUserPlan(data.id);
      this.getList();
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.configValueList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 获取计划信息
    getUserPlan(id){
      getUserPlan(id).then(response => {
        //设置单位
        this.unit = response.unit==null ? '':response.unit;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        valueClass: 'LONG',
        orderIndex:1,
        casCadeType:'NOT_CASCADE'
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleCreate() {
      if(this.isObjectEmpty(this.queryParams.userPlanId)){
        this.msgError('没有父类信息，无法新增');
        return;
      }
      this.reset();
      this.form.userPlanId = this.queryParams.userPlanId;
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getUserPlanConfigValue(id).then(response => {
        this.form = response;
        this.form.userPlanId = response.userPlan.id;
        //数字转字符
        this.form.year = response.year+'';
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateUserPlanConfigValue(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createUserPlanConfigValue(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteUserPlanConfigValue(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有购买来源数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportUserPlanConfigValue(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
