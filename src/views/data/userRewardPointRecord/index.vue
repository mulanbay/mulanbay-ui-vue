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
      <el-form-item v-if="moreCdn==true" label="积分来源" prop="rewardSource">
        <el-select
          v-model="queryParams.rewardSource"
          placeholder="积分来源"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in rewardSourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="主键编号" prop="sourceId">
        <el-input
          v-model="queryParams.sourceId"
          placeholder="主键编号"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="积分过滤" prop="rewardsCompareType">
        <el-select
          v-model="queryParams.rewardsCompareType"
          placeholder="类型"
          clearable
          size="small"
          style="width:100px"
        >
          <el-option
            v-for="dict in rewardsCompareTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-input-number v-model="queryParams.rewards" style="width:100px" controls-position="right" :min="0" :controls="true" :precision="0"/>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['data:userRewardPointRecord:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleSourceStat" v-hasPermi="['data:userRewardPointRecord:pointsSourceStat']">来源统计</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="userRewardPointRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="奖励积分" fixed="left" align="center">
        <template slot-scope="{row}">
          <span v-if="row.rewards<0" style="color:red">
           {{ row.rewards }}
          </span>
          <span v-else-if="row.rewards>0" style="color:green">
           {{ row.rewards }}
          </span>
          <span v-else>
            {{ row.rewards }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>
           {{ row.sourceName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="来源类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.rewardSourceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源主键值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sourceId }}</span>
          <span class="link-type" @click="handleSourceId(row)"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="消息内容" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.messageId!=null" class="link-type" @click="showMessageDetail(row)">
            <i class="el-icon-info" />
            </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="当前累计积分" align="center">
        <template slot-scope="{row}">
          <span>{{ row.afterPoints }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" align="center" width="120">
        <template slot-scope="{row}">
          <span class="link-type" @click="statValuePoint(row)">
            <i class="el-icon-s-data" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" width="120">
        <template slot-scope="{row}">
          <span class="link-type" @click="msgAlert('备注信息',row.remark)">
            <i class="el-icon-info" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="110" :show-overflow-tooltip="true">
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

    <!-- 来源详情 -->
    <el-dialog :title="sourceTitle" width="600px" :visible.sync="sourceOpen"  append-to-body>
      <source-detail :jsonData="jsonData"/>
    </el-dialog>

    <!-- 来源详情 -->
    <el-dialog :title="valueStatTitle" width="900px" :visible.sync="valueStatOpen"  append-to-body>
      <value-stat :userRewardPointRecordData="userRewardPointRecordData"/>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,deleteUserRewardPointRecord,getUserRewardPointRecordMessageContent} from "@/api/data/userRewardPointRecord";
import {getUserMessageByUser} from "@/api/log/userMessage";
import {tillNowSeconds} from "@/utils/datetime";
import SourceDetail from '../../common/jsonTreeTable'
import ValueStat from './pointsValueStat'

export default {
  name: "UserRewardPointRecord",
  components: {
    'source-detail':SourceDetail,
    'value-stat':ValueStat
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //来源详情 start
      // 弹出层标题
      sourceTitle: "",
      // 是否显示弹出层
      sourceOpen: false,
      // 详情数据
      jsonData:{
        jsonObject:undefined
      },
      //来源详情 end
      //值的统计 start
      // 弹出层标题
      valueStatTitle: "",
      // 是否显示弹出层
      valueStatOpen: false,
      // 详情数据
      userRewardPointRecordData: {
        sourceId:undefined,
        rewardSource:undefined
      },
      //值的统计 end
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
      userRewardPointRecordList:[],
      rewardSourceOptions:[],
      rewardsCompareTypeOptions:[],
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
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('RewardSource', 'FIELD', false).then(response => {
      this.rewardSourceOptions = response;
    });
    this.getDictItemTree('URP_COMPARE_TYPE',false).then(response => {
      this.rewardsCompareTypeOptions = response;
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
    /** 统计 */
    statValuePoint(row){
      this.valueStatTitle = '值统计';
      // 是否显示弹出层
      this.valueStatOpen = true ;
      // 详情数据
      this.userRewardPointRecordData = Object.assign({}, this.userRewardPointRecordData, {
        sourceId : row.sourceId,rewardSource:row.rewardSource
      });
    },
    /** 以来源主键过滤 */
    handleSourceId(row){
      this.queryParams.sourceId=row.sourceId;
      this.moreCdn=true;
      this.handleQuery();
    },
    /** 消息内容 */
    showMessageDetail(row){
      getUserRewardPointRecordMessageContent(row.id).then(
        response => {
          if(response.rewardSource=='OPERATION'||response.rewardSource=='COMMON_RECORD'){
            this.sourceOpen = true;
            this.sourceTitle = "请求地址:"+response.url;
            this.jsonData = Object.assign({}, this.jsonData, {
              jsonObject: eval('(' + response.para + ')'),
            });
          }else{
            this.msgAlert('消息内容',response.para);
          }
        }
      );
    },
    /** 根据来统计 */
    handleSourceStat(){
      //路由定向
      this.$router.push({name:'UserRewardPointRecordPointsSourceStat',query: {}})
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.userRewardPointRecordList = response.rows;
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteUserRewardPointRecordList(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    }
  }
};
</script>
