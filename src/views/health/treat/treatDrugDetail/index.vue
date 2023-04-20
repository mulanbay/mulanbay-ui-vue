<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="用药日期">
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
      <el-form-item label="合并相同药名" prop="mergeSameName">
        <el-switch v-model="queryParams.mergeSameName"  @change="handleQuery"></el-switch>
        <span class="link-type" @click="msgAlert('提示','合并相同药名：多次看病记录有相同药品名称的药合并在一起统计。否则只统计该次看病记录中该药品的记录')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatDrugDetail:query']">搜索</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate" v-hasPermi="['health:treat:treatDrugDetail:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="treatDrugDetailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.occurTime}}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药量" align="center">
        <template slot-scope="{row}">
          <span v-if="row.ec==null">
          </span>
          <span v-else-if="row.ec!=row.treatDrug.ec" style="color: red;">
           {{ row.ec+row.eu}}
          </span>
          <span v-else style="color: green;">
           {{ row.ec+row.eu}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['health:treat:treatDrugDetail:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatDrugDetail:delete']"
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

    <!-- 新增用药页面 -->
    <el-dialog :title="drugDetailTitle" width="450px" :visible.sync="drugDetailVisible"  append-to-body>
      <treat-drug-detail-detail
        :treatForDrugDetailData="treatForDrugDetailData"
        @closeMe="closeTreatDrugDetailDetail"
        @refreshList="handleQuery"
      />
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,deleteTreatDrugDetail} from "@/api/health/treat/treatDrugDetail";
import TreatDrugDetailDetail from '../treatDrugDetail/detail'

export default {
  name: "TreatDrugDetail",
  components: {
    'treat-drug-detail-detail':TreatDrugDetailDetail
  },
  props: {
    //父层带过来的信息值
    treatForDrugDetailListData:{
      treatDrugId:undefined
    }
  },
  data() {
    return {
      //新增用药详情页面 start
      drugDetailTitle:'',
      //给药品信息使用的外键
      treatForDrugDetailData:{
        id:undefined,
        treatDrugId:undefined
      },
      drugDetailVisible:false,
      //新增用药详情页面 end
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
      treatDrugDetailList:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        mergeSameName:false
      },
      booleanOptions:this.booleanOptions,
      //疾病标签
      tagsOptions:[],
      //看病类型
      diseaseOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.treatForDrugDetailListData);
  },
  //监听父层带过来的账户信息值
  watch:{
    treatForDrugDetailListData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      //this.reset();
      this.queryParams.treatDrugId=data.treatDrugId;
      this.getList();
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.treatDrugDetailList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
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
    /** 增加用药详情编辑操作 */
    handleCreate(){
      this.drugDetailVisible = true;
      this.drugDetailTitle = "添加用药";
      this.treatForDrugDetailData = Object.assign({}, this.treatForDrugDetailData, {
        id:null,
        treatDrugId: this.queryParams.treatDrugId
      });
    },
    closeTreatDrugDetailDetail(){
      this.drugDetailVisible = false;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.drugDetailVisible = true;
      this.drugDetailTitle = "修改用药";
      this.treatForDrugDetailData = Object.assign({}, this.treatForDrugDetailData, {
        id: row.id,
        treatRecordId:undefined
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
          return deleteTreatDrugDetail(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    }
  }
};
</script>
