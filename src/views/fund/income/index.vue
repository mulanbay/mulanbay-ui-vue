<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="关联账户" prop="accountId">
        <el-select
          v-model="queryParams.accountId"
          placeholder="账户"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in accountOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="收入类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="收入状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['fund:income:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['fund:income:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['fund:income:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fund:income:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleStat"
          v-hasPermi="['fund:income:stat']"
        >分析统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['fund:income:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-document"
          size="mini"
          :disabled="single"
          @click="handleLifeArchives"
          v-hasPermi="['life:lifeArchives:create']"
        >同步档案</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="incomeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" align="center">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" width="50">
        <template slot-scope="{row}">
          <span v-if="row.buyRecordId != null">
           <span class="link-type" @click="handleBuyRecordInfo(row.buyRecordId)"><i class="el-icon-info"></i></span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发生时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.occurTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联账户" align="center" width="95" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ isObjectEmpty(row.account) ? '--':row.account.name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" disabled active-value="ENABLE" inactive-value="DISABLE"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['fund:income:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fund:income:delete']"
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
        <el-form-item label="收入名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="收入金额" prop="amount">
          <el-input-number v-model="form.amount" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>
        </el-form-item>
        <el-form-item label="关联账户" prop="accountId">
          <el-select
            v-model="form.accountId"
            placeholder="账户"
            clearable
            :style="{width: '100%'}"
          >
            <el-option
              v-for="dict in accountOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收入类型" prop="type">
          <el-select
            v-model="form.type"
            placeholder="类型"
          >
            <el-option
              v-for="dict in typeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发生时间" prop="occurTime">
              <el-date-picker type="datetime" v-model="form.occurTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                         placeholder="请选择时间" clearable :style="{width: '200px'}" >
              </el-date-picker>
        </el-form-item>
        <el-form-item label="关联消费" prop="buyRecordId">
          <el-input-number v-model="form.buyRecordId" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0"/>
          (原始消费记录ID)
        </el-form-item>
        <el-form-item label="收入状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in commonStatusOptions"
              :key="dict.id"
              :label="dict.id"
            >{{dict.text}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
           <el-input type="textarea" v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 消费记录详情 -->
    <el-dialog :title="buyRecordDetailTitle" width="500px" :visible.sync="buyRecordDetailVisible">
      <buyRecord-detail :keyValueListData="keyValueListData"/>
    </el-dialog>


    <!-- 人生档案详情页面 -->
      <el-dialog :title="ladTitle" width="650px" :visible.sync="ladOpen"  append-to-body>
        <life-archives-detail :lifeArchivesData="lifeArchivesData" @closeMe="closeLad"/>
      </el-dialog>
    </div>

  </div>
</template>

<script>
import {fetchList,changeIncomeStatus,getIncome,createIncome,updateIncome,deleteIncome} from "@/api/fund/income";
import {getAccountTree} from "@/api/fund/account";
import {getBuyRecord} from "@/api/consume/buyRecord";
import BuyRecordDetail from '../../common/keyValueTable'
import LifeArchivesDetail from '../../life/lifeArchives/detail'

export default {
  name: "Income",
  components: {
    'buyRecord-detail':BuyRecordDetail,
    'life-archives-detail':LifeArchivesDetail
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //同步档案属性 start
      ladTitle:'',
      ladOpen:false,
      lifeArchivesData:{},
      //同步档案属性 end
      //消费详情显示
      buyRecordDetailVisible:false,
      //消费详情值(子页面使用)
      keyValueListData: [],
      //消费详情标题
      buyRecordDetailTitle:'',
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
      incomeList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //账户列表
      accountOptions:[],
      //状态
      commonStatusOptions:this.commonStatusOptions,
      //收入类型
      typeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "收入名称不能为空", trigger: "blur" }
        ],
        amount: [
          { required: true, message: "收入金额不能为空", trigger: "blur" }
        ],
        occurTime: [
          { required: true, message: "发生时间不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "收入类型不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    //查询账户树
    this.getAccountTreeselect();
    this.getEnumTree('IncomeType','FIELD',false).then(response => {
      this.typeOptions = response;
    });
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 同步档案 */
    handleLifeArchives(){
      const id = this.ids.join(",")
      getIncome(id).then(response => {
        this.ladTitle='同步档案';
        this.ladOpen=true;
        this.lifeArchivesData={
          id:undefined,
          title:'收入信息',
          content:response.name+',收入:'+response.amount+'元',
          date:response.occurTime,
          bussType:'FUND',
          relatedBeans:'Income',
          sourceId:response.id,
          remark:undefined
        };
      });
    },
    /** 关闭同步档案 */
    closeLad(){
      this.ladOpen=false;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.incomeList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 查询搜索条件中的账户下拉树结构 */
    getAccountTreeselect() {
      getAccountTree(false).then(response => {
        this.accountOptions = response;
      });
    },
    //账户统计
    handleStat() {
      //路由定向
      this.$router.push({path:'income/stat',query: {}})
    },
    /** 收入来源的购买记录详情 */
    handleBuyRecordInfo(buyRecordId){
      getBuyRecord(buyRecordId).then(response => {
        this.buyRecordDetailTitle=response.goodsName;
        this.buyRecordDetailVisible=true;
        var brData  = new Array();
        brData.push({key:'购买时间',value :response.buyDate });
        brData.push({key:'购买价格',value :this.formatMoney(response.totalPrice) });
        brData.push({key:'售出时间',value :response.deleteDate });
        brData.push({key:'售出价格',value :this.formatMoney(response.soldPrice) });
        var dd = response.soldPrice*10/response.totalPrice;
        brData.push({key:'折旧率',value :(dd.toFixed(1)+'折')});
        this.keyValueListData =brData;
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
        name: undefined,
        orderIndex: 0,
        status: "ENABLE"
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getIncome(id).then(response => {
        this.form = response;
        if(!this.isObjectEmpty(response.account)){
          this.form.accountId = response.account.id+'';
        }
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateIncome(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createIncome(this.form).then(response => {
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
          return deleteIncome(ids);
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
          return exportRole(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
