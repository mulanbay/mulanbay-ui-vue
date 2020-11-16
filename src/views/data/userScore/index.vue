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
      <el-form-item label="分数范围">
          <el-input-number v-model="queryParams.minScore" clearable :min="0" label="" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.maxScore" clearable :min="0" label="" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['data:userScore:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleReSave" v-hasPermi="['data:userScore:reSave']">重新统计</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="userScoreList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分" fixed="left" align="center">
        <template slot-scope="{row}">
          <span v-if="row.score>=80" style="color:green">
           {{ row.score }}
          </span>
          <span v-else-if="row.score<60" style="color:red">
           {{ row.score }}
          </span>
          <span v-else>
            {{ row.score }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="数据日期" align="center" >
        <template slot-scope="{row}">
          <span>
           {{ row.endTime.substring(0,10) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="统计时间段" align="center">
        <template slot-scope="{row}">
          <span>{{ formatDateRange(row)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" align="center" width="120">
        <template slot-scope="{row}">
          <span class="link-type" @click="showScoreDetail(row)">
            <i class="el-icon-info" />
            </span>
        </template>
      </el-table-column>
      <el-table-column label="分析" align="center" width="120">
        <template slot-scope="{row}">
          <span class="link-type" @click="analyseScoreDetail(row)">
            <i class="el-icon-s-data" />
            </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="180">
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

    <!-- 积分详情 -->
    <el-dialog :title="scoreDetailTitle" width="720px" :visible.sync="scoreDetailOpen"  append-to-body>
      <score-detail :userScoreData="userScoreData"/>
    </el-dialog>
    
    <!-- 积分分析 -->
    <el-dialog :title="scoreAnalyseTitle" width="720px" :visible.sync="scoreAnalyseOpen"  append-to-body>
      <score-analyse :userScoreData="userScoreAnalyseData"/>
    </el-dialog>
    
    <!-- 重新统计 -->
    <el-dialog :title="reSaveTitle" width="380px" :visible.sync="reSaveOpen"  append-to-body>
      <re-save @closeMe="closeReSave"/>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,getScoreDetail} from "@/api/data/userScore";
import {tillNowSeconds} from "@/utils/datetime";
import ScoreDetail from './detail'
import ReSave from './reSave'
import ScoreAnalyse from './analyse'

export default {
  name: "UserScore",
  components: {
    'score-detail':ScoreDetail,
    'score-analyse':ScoreAnalyse,
    're-save':ReSave
  },
  data() {
    return {
      //重新统计 start
      reSaveTitle:'',
      reSaveOpen:false,
      //重新统计 end
      //积分详情 start
      scoreDetailTitle:'',
      scoreDetailOpen:false,
      userScoreData:{list:[]},
      //积分详情 end
      //积分分析 start
      scoreAnalyseTitle:'',
      scoreAnalyseOpen:false,
      userScoreAnalyseData:{id:undefined},
      //积分分析 end
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
      userScoreList:[],
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
    /** 时间段 */
    formatDateRange(row){
      return row.startTime.substring(0,10) + '~~' +row.endTime.substring(0,10);
    },
    /** 积分详情 */
    showScoreDetail(row){
      this.scoreDetailTitle = '['+row.endTime.substring(0,10)+']评分详情,得分:'+row.score;
      // 是否显示弹出层
      this.scoreDetailOpen = true ;
      getScoreDetail(row.id).then(
        response => {
          let totalScore=0;
          let totalMaxScore=0;
          let dataList = new Array();
          for (let i = 0; i < response.length; i++) {
            let row = {
              id:i+1,
              name:response[i].name,
              score:response[i].score,
              maxScore:response[i].maxScore,
              statValue:response[i].statValue,
              limitValue:response[i].limitValue,
              remark:response[i].remark
            };
            dataList.push(row);
            totalScore+=response[i].score;
            totalMaxScore+=response[i].maxScore;
          }
          let row = {
            id:'',
            name:'总分',
            score:totalScore,
            maxScore:totalMaxScore,
            statValue:'',
            limitValue:'',
            remark:''
          };
          dataList.push(row);
          this.userScoreData.list = dataList;
        }
      );
    },
    /** 积分分析 */
    analyseScoreDetail(row){
      this.scoreAnalyseTitle = '评分分析';
      // 是否显示弹出层
      this.scoreAnalyseOpen = true ;
      this.userScoreAnalyseData = Object.assign({}, this.userScoreAnalyseData, {
        id: row.id
      });
    },
    /** 重新统计 */
    handleReSave(){
      this.reSaveTitle='重新统计评分';
      this.reSaveOpen = true;
    },
    closeReSave(){
      this.reSaveOpen = false;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.userScoreList = response.rows;
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
          return deleteUserScore(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    }
  }
};
</script>
