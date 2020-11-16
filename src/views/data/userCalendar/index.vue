<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item v-if="moreCdn==true" label="起止日期">
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
      <el-form-item v-if="moreCdn==true" label="唯一标识" prop="bussIdentityKey">
        <el-input
          v-model="queryParams.bussIdentityKey"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="日历类型" prop="sourceType">
        <el-select
          v-model="queryParams.sourceType"
          placeholder="类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in sourceTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="完成类型" prop="finishType">
        <el-select
          v-model="queryParams.finishType"
          placeholder="类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in finishTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="周期类型" prop="period">
        <el-select
          v-model="queryParams.period"
          placeholder="周期"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in periodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['data:userCalendar:query']">搜索</el-button>
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
          v-hasPermi="['data:userCalendar:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['data:userCalendar:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['data:userCalendar:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['data:userCalendar:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="userCalendarList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ formatId(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" fixed="left" min-width="160px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.expiredSeconds>0">
           <span style="color:red"  class="link-type" @click="handleUpdate(row)">
            {{ row.title }}
           </span>
          </span>
          <span v-else class="link-type" @click="handleUpdate(row)">
            {{ row.title }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="延迟次数" align="center">
        <template slot-scope="{row}">
          <span v-if="row.delayCounts>=10">
           <span style="color:red">{{ row.delayCounts }}</span>
          </span>
          <span v-else-if="row.delayCounts>=5">
           <span style="color:purple">{{ row.delayCounts }}</span>
          </span>
          <span v-else-if="row.delayCounts>=3">
           <span style="color:orangered">{{ row.delayCounts }}</span>
          </span>
          <span v-else>
           {{ row.delayCounts }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center"  width="120">
        <template slot-scope="{row}">
          <span>{{ row.bussDay.substring(0,10) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" align="center"  width="120">
        <template slot-scope="{row}">
          <span v-if="row.expiredSeconds>=10*365*3600">
           长期
          </span>
          <span v-else>{{ row.expireTime.substring(0,10) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日历时间" align="center" width="95">
        <template slot-scope="{row}">
          <span v-if="row.allDay==true">
           全天
          </span>
          <span v-else>{{ row.bussDay.substring(11,16) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定流水" align="center">
        <template slot-scope="{row}">
          <span v-if="row.calendarConfigId!=null">
           <span style="color:green"><i class="el-icon-check" /></span>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sourceTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="周期" align="center">
        <template slot-scope="{row}">
          <span>{{ row.periodName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="只读" align="center" width="95">
        <template slot-scope="{row}">
          <el-switch v-model="row.readOnly" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="完成类型" align="center">
        <template slot-scope="{row}">
          <span v-if="row.finishType=='AUTO'">
           <span style="color:green">{{ row.finishTypeName }}</span>
          </span>
          <span v-else-if="row.finishType=='MANUAL'">
           <span style="color:#00008b">{{ row.finishTypeName }}</span>
          </span>
          <span v-else-if="row.finishType=='EXPIRED'">
           <span style="color:#1e90ff">{{ row.finishTypeName }}</span>
          </span>
          <span v-else-if="row.period=='ONCE'">
           <span style="color:red">未完成</span>
          </span>
          <span v-else>
           --
          </span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.finishedTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成消息内容" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.finishSourceId!=null" class="link-type" @click="showFinishMessageDetail(row)">
            <i class="el-icon-info" />
            </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="源消息内容" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.messageId!=null" class="link-type" @click="showMessageDetail(row)">
            <i class="el-icon-info" />
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="唯一标识" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.bussIdentityKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span v-if="scope.row.finishType==null">
           <el-button
             size="mini"
             type="text"
             icon="el-icon-circle-close"
             @click="finishUserCalendar(scope.row)"
             v-hasPermi="['data:userCalendar:finish']"
           >关闭</el-button>
          </span>
          <span v-else>
           <el-button
             size="mini"
             type="text"
             icon="el-icon-s-open"
             @click="reOpenUserCalendar(scope.row)"
             v-hasPermi="['data:userCalendar:reOpen']"
           >重开</el-button>
          </span>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['data:userCalendar:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['data:userCalendar:delete']"
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

    <!-- 表单 -->
    <el-dialog :title="title" width="800px" :visible.sync="open">
      <user-calendar-detail :userCalendarData="userCalendarData" @closeMe="closeDetail" @refreshList="handleQuery"/>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,deleteUserCalendar,finishUserCalendar,reOpenUserCalendar} from "@/api/data/userCalendar";
import {getUserMessageByUser} from "@/api/log/userMessage";
import {tillNowSeconds} from "@/utils/datetime";
import UserCalendarDetail from './detail'

export default {
  name: "UserCalendar",
  components: {
    'user-calendar-detail':UserCalendarDetail
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
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
      userCalendarList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 详情数据
      userCalendarData:{
        id:undefined
      },
      sourceTypeOptions:[],
      finishTypeOptions:[],
      periodOptions:[],
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
    this.getEnumTree('UserCalendarSource', 'FIELD', false).then(response => {
      this.sourceTypeOptions = response;
    });
    this.getEnumTree('UserCalendarFinishType', 'FIELD', false).then(response => {
      this.finishTypeOptions = response;
    });
    this.getEnumTree('PeriodType', 'FIELD', false).then(response => {
      this.periodOptions = response;
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
    /** 计算列的值 */
    formatId(row){
      let n = tillNowSeconds('',row.expireTime);
      row.expiredSeconds =n.toFixed(0);
      return row.id;
    },
    /** 关闭 */
    finishUserCalendar(row){
      this.$confirm('是否确认关闭"' + row.title + '"项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return finishUserCalendar(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("关闭成功");
        }).catch(function() {});
    },
    /** 重开 */
    reOpenUserCalendar(row){
      this.$confirm('是否确认要重新开启"' + row.title + '"项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return reOpenUserCalendar(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("重新开启成功");
        }).catch(function() {});
    },
    /** 完成的消息内容 */
    showFinishMessageDetail(row){
      getUserMessageByUser(row.finishSourceId).then(
        response => {
          if(response==null){
            this.msgError('未找到相关消息内容');
          }else{
            this.msgAlert(response.title, response.content);
          }
        }
      );
    },
    /** 源消息内容 */
    showMessageDetail(row){
      getUserMessageByUser(row.messageId).then(
        response => {
          if(response==null){
            this.msgError('未找到相关消息内容');
          }else{
            this.msgAlert(response.title, response.content);
          }
        }
      );
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.userCalendarList = response.rows;
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
    /** 关闭详情操作 */
    closeDetail(){
      this.open = false;
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.open = true;
      this.title = "添加";
      this.userCalendarData = Object.assign({}, this.userCalendarData, {
        id: undefined,
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.open = true;
      this.title = "修改";
      const id = row.id || this.ids.join(",");
      this.userCalendarData = Object.assign({}, this.userCalendarData, {
        id: id,
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
          return deleteUserCalendar(ids);
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
          return exportUserCalendar(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
