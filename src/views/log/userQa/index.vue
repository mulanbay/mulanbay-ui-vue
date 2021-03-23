<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="起止日期">
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
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['log:userQa:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="userQaList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户信息" align="center" >
        <template slot-scope="{row}">
          <span v-if="row.userId!=null">
           UserID:{{ row.userId }}
          </span>
          <span v-else>
           WxOpenId:{{ row.openId }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="请求内容"  min-width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row.id)">{{ row.requestContent }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请求来源" align="center" width="120">
        <template slot-scope="{row}">
           {{ row.sourceName }}
        </template>
      </el-table-column>
      <el-table-column label="是否命中" align="center" width="100">
        <template slot-scope="{row}">
          <span v-if="row.replyQaId!=null">
           <i class="el-icon-success" style="color: green;"/>
          </span>
          <span v-else>
           <i class="el-icon-error" style="color: red;"/>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="请求时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
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


    <!-- 详情 -->
    <el-dialog :title="detailTitle" width="800px" :visible.sync="detailOpen"  append-to-body>
      <detail :userQaData="userQaData"/>
    </el-dialog>


  </div>
</template>

<script>
  import {fetchList} from "@/api/log/userQa";
  import Detail from './detail'

export default {
  name: "UserQa",
  components: {
    'detail':Detail
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      // 详情 start
      detailTitle: "",
      // 是否显示弹出层
      detailOpen: false,
      // 详情数据
      userQaData:{
        id:undefined
      },
      // 详情 end
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
      userQaList:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10
      }
    };
  },
  created() {
    this.getList();
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
    /** 被比较的消费记录和该条消费记录 */
    handleDetail(id){
      this.detailOpen=true;
      this.detailTitle='详情';
      this.userQaData = Object.assign({}, this.userQaData, {
        id: id,
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.userQaList = response.rows;
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
    }
  }
};
</script>
