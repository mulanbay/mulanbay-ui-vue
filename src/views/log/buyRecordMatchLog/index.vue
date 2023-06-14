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
      <el-form-item v-if="moreCdn==true" label="匹配类型" prop="compareIdType">
        <el-select
          v-model="queryParams.compareIdType"
          placeholder="匹配类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in compareIdTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['log:buyRecordMatchLog:query']">搜索</el-button>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleBudgetLogStat" v-hasPermi="['log:buyRecordMatchLog:stat']">分析</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="buyRecordMatchLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center"  min-width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="匹配类型" align="center" width="80">
        <template slot-scope="{row}">
           <span v-if="row.compareId!=null">
            <el-tag type="success">历史商品</el-tag>
           </span>
           <span v-else>
            <el-tag type="warning">商品类型</el-tag>
           </span>
        </template>
      </el-table-column>
      <el-table-column label="AI匹配度" align="center">
        <template slot-scope="{row}">
          {{ row.aiMatch }}
        </template>
      </el-table-column>
      <el-table-column label="实际匹配度" align="center">
        <template slot-scope="{row}">
          {{ row.acMatch }}
        </template>
      </el-table-column>
      <el-table-column label="消费记录" align="center" width="80">
        <template slot-scope="{row}">
          <span class="link-type" @click="showBuyRecord(row)">
            <i class="el-icon-info" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="数据比较" align="center" width="80">
        <template slot-scope="{row}">
           <span class="link-type" @click="showCompare(row)">
            <svg-icon icon-class="compare" />
           </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
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

    <!-- 消费详情详情 -->
    <el-dialog :title="sourceTitle" width="600px" :visible.sync="sourceOpen"  append-to-body>
      <source-detail :jsonData="jsonData"/>
    </el-dialog>

    <!-- 比较信息 -->
    <el-dialog :title="cdTitle" width="650px" :visible.sync="cdOpen" append-to-body>
      <compare-data :logData="logData" />
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,getBuyRecord,getCompareData} from "@/api/consume/buyRecordMatchLog";
import SourceDetail from '../../common/jsonTreeTable'
import CompareData from './compareData'

export default {
  name: "BuyRecordMatchLog",
  components: {
    'source-detail':SourceDetail,
    'compare-data':CompareData
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      // 消费详情 start
      sourceTitle: "",
      // 是否显示弹出层
      sourceOpen: false,
      // 详情数据
      jsonData:{
        jsonObject:undefined
      },
      // 消费详情 end
      // 比较信息
      cdTitle:'',
      cdOpen:false,
      logData:{
        id:undefined
      },
      compareIdTypeOptions:[],
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
      buyRecordMatchLogList:[],
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
    this.getDictItemTree('BUY_RECORD_MATCH_LOG_COMPARE_TYPE',false).then(response => {
      this.compareIdTypeOptions = response;
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
    /** 统计分析 */
    handleBudgetLogStat(){
      //路由定向
      this.$router.push({name:'BuyRecordMatchLogStat',query: {}})
    },
    /** 消费记录详情 */
    showBuyRecord(row){
      this.sourceOpen = true;
      this.sourceTitle ='ID['+row.id+']消费记录详情';
      getBuyRecord(row.buyRecordId).then(response => {
        this.jsonData = Object.assign({}, this.jsonData, {
          jsonObject: response
        });
      });

    },
    /** 被比较的消费记录和该条消费记录 */
    showCompare(row){
      this.cdOpen=true;
      this.cdTitle='['+row.goodsName+']比较详情';
      this.logData = Object.assign({}, this.logData, {
        id: row.id,
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.buyRecordMatchLogList = response.rows;
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
