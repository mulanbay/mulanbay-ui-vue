<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['fund:account:query']">搜索</el-button>
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
          v-hasPermi="['fund:account:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['fund:account:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fund:account:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['fund:account:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleStat"
          v-hasPermi="['fund:account:stat']"
        >账户统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleAnalyse(null)"
          v-hasPermi="['fund:accountFlow:analyse']"
        >账户分析</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleForecast"
          v-hasPermi="['fund:account:forecast']"
        >账户预测</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreateSnapshot"
          v-hasPermi="['fund:account:createSnapshotInfo']"
        >生成快照</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="accountList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="余额" align="center">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="卡号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.cardNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产状态" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.statusName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户变更" align="center" width="80">
        <template slot-scope="{row}">
           <span class="link-type" @click="handleChange(row)" v-hasPermi="['fund:account:change']">
            <i class="el-icon-edit-outline" />
           </span>
        </template>
      </el-table-column>
      <el-table-column label="分析" align="center" width="80">
        <template slot-scope="{row}">
           <span class="link-type" @click="handleAnalyse(row)">
            <i class="el-icon-s-data" />
           </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['fund:account:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fund:account:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="账户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="账户卡号" prop="cardNo">
          <el-input v-model="form.cardNo" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="账户余额" prop="amount">
          <el-input-number v-model="form.amount" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>
        </el-form-item>
        <el-form-item label="账户类型">
          <el-select v-model="form.type" placeholder="请选择">
            <el-option
              v-for="dict in typeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="资产状态">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option
              v-for="dict in statusOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改账户对话框 -->
    <el-dialog :title="changeTitle" :visible.sync="openChange" width="550px" append-to-body>
      <el-form ref="changeForm" :model="changeForm" :rules="changeRules" label-width="100px">
        <el-form-item label="修改后金额" prop="afterAmount">
          <el-input-number v-model="changeForm.afterAmount" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
           <el-input type="textarea" v-model="changeForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitChangeForm">确 定</el-button>
        <el-button @click="cancelChange">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 生成快照 -->
    <el-dialog title="生成快照" width="500px" :visible.sync="createSnapshotVisible">
      <!-- closeMe为子组件中的关闭方法-->
      <snapshot-detail  @closeMe="closeSnapshotDetail"/>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,changeAccountStatus,changeAccount,getAccount,createAccount,updateAccount,deleteAccount} from "@/api/fund/account";
import SnapshotDetail from '../accountSnapshotInfo/detail'

export default {
  name: "Account",
  components: {
    'snapshot-detail':SnapshotDetail
  },
  data() {
    return {
      //生成快照
      createSnapshotVisible:false,
      // 遮罩
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 总条数
      accountList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示修改账户弹出层
      openChange: false,
      // 账户类型
      typeOptions:[],
      // 账户状态
      statusOptions:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 账户变更表单
      changeTitle:undefined,
      changeForm: {
        id: undefined,
        afterAmount: undefined,
        remark: undefined
      },
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "账户名称不能为空", trigger: "blur" }
        ],
        amount: [
          { required: true, message: "账户余额不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "资产类型不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "资产状态不能为空", trigger: "blur" }
        ]
      },
      // 表单校验
      changeRules: {
        afterAmount: [
          { required: true, message: "修改后的金额不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('AccountType','FIELD',false).then(response => {
      this.typeOptions = response;
    });
    this.getEnumTree('AccountStatus','FIELD',false).then(response => {
      this.statusOptions = response;
    });
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.accountList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeAccountStatus(row.id, row.status);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.status = row.status === "ENABLE" ? "DISABLE" : "ENABLE";
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮
    cancelChange() {
      this.openChange = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        type: 'BANK',
        status: "IMMOVABLE"
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
      this.reset();
      this.open = true;
      this.title = "添加";
    },
    /** 修改账户按钮操作 */
    handleChange(row) {
      this.changeForm.id=row.id;
      this.changeForm.afterAmount=row.amount;
      this.changeTitle = '变更账户['+row.name+']';
      this.openChange = true;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getAccount(id).then(response => {
        this.form = response;
        this.open = true;
        this.title = "修改";
      });
    },
    //账户分析
    handleAnalyse(row) {
      //openWindow('accountFlow/analyse','账户分析',800,600);
      const id = (row ===null ? "" : row.id);
      //路由定向
      this.$router.push({name:'AccountFlowAnalyse',query: {id:id}})
    },
    //账户统计
    handleStat() {
      //路由定向
      this.$router.push({name:'AccountStat',query: {}})
    },
    //账户预测
    handleForecast() {
      //路由定向
      this.$router.push({name:'AccountForecast',query: {}})
    },
    //生成快照
    handleCreateSnapshot() {
      this.createSnapshotVisible = true;
    },
    //关闭子组件方法
    closeSnapshotDetail(){
      this.createSnapshotVisible = false;
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateAccount(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createAccount(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 提交按钮 */
    submitChangeForm: function() {
      this.$refs["changeForm"].validate(valid => {
        changeAccount(this.changeForm).then(response => {
          this.msgSuccess("修改成功");
          this.openChange = false;
          this.getList();
        });
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
          return deleteAccount(ids);
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
          return exportAccount(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
