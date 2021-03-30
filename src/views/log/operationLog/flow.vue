<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="操作对象" prop="beanName">
       <el-select
         v-model="queryParams.beanName"
         placeholder="关联类名"
         collapse-tags
         size="small"
         style="width: 200px"
       >
         <el-option
           v-for="dict in beanNameOptions"
           :key="dict.id"
           :label="dict.text"
           :value="dict.id"
         />
       </el-select>
      </el-form-item>
      <el-form-item label="主键编号" prop="idValue">
        <el-input
          v-model="queryParams.idValue"
          size="small"
          style="width: 160px"
        />
      </el-form-item>
      <el-form-item label="操作类型" prop="functionTypes">
        <el-select
          v-model="queryParams.functionTypes"
          placeholder="操作类型"
          clearable
          multiple
          collapse-tags
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in functionTypesOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
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
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['log:operationLog:flow']">搜索</el-button>
      </el-form-item>
    </el-form>

    <!--数据-->
    <el-row>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper"  >
            <el-timeline v-loading="loading" :reverse="reverse" >
              <template v-for="item in flowList">
                <el-timeline-item :timestamp="item.timestamp" :type="item.type" placement="top">
                  <el-card class="box-card">
                    <div slot="header" class="clearfix">
                      <i :class="item.icon"></i>
                      <el-tag v-if="item.functionTypeName!=null">{{ item.functionTypeName }}</el-tag>
                      <el-divider direction="vertical"></el-divider>
                      {{item.content}}
                      <el-button size="mini" type="text" style="float: right; padding: 3px 0" icon="el-icon-info" @click="handleDetail(item.id)"
                        v-hasPermi="['log:operationLog:get']">
                        请求参数
                      </el-button>
                    </div>
                    <div class="el-table el-table--enable-row-hover el-table--medium">
                      <table cellspacing="0" style="width: 100%;">
                        <tbody>
                          <tr>
                            <td><div class="cell">操作用户</div></td>
                            <td>
                              <div class="cell">
                                <span>{{ item.userName+'  (ID:'+item.userId +')'}}</span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td><div class="cell">请求IP</div></td>
                            <td>
                              <div class="cell">
                                <span>{{ item.ipAddress}}</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </el-card>
                </el-timeline-item>
              </template>
            </el-timeline>
          </div>

          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.page"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
          />

        </el-card>
      </el-col>
      <el-col :span="12" class="card-box"  align="center">
        <el-card>
          <span>{{detailTitle}}</span>
        </el-card>
        <el-card v-loading="detailLoading">
          <div class="chart-wrapper">
            <detail-data :jsonData="detailData"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {flow as getFlowList,getDetail } from "@/api/log/operationLog";
  import {getDomainClassNamesTree} from "@/api/auth/systemFunction";
  import {copyObject,getQueryObject,deepClone} from "@/utils/index";
  import {string2Json} from "@/utils/mulanbay";
  import DataList from '../../common/jsonTreeTable'

export default {
  name: "OperationLogFlow",
  components: {
    'detail-data':DataList
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //详情
      detailLoading:false,
      detailData:{},
      detailTitle:'参数详情',
      //流水列表
      flowList:[],
      total:0,
      reverse:false,
      loading:false,
      //类名选择项
      beanNameOptions:[],
      //类型选择项
      functionTypesOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        beanName:undefined,
        idValue:undefined,
        functionTypes:['CREATE','EDIT','DELETE'],
        page:1,
        pageSize:10
      }
    };
  },
  created() {
    this.getDomainClassNamesTreeselect();
    this.getDictItemTree('OPERATION_LOG_FLOW_TYPE',false).then(response => {
      this.functionTypesOptions = response;
    });
    let qb = getQueryObject(null);
    if(qb.beanName!=null){
      //业务页面进来
      this.queryParams.beanName = qb.beanName;
      this.queryParams.idValue = qb.idValue;
      this.getList();
    }
  },
  methods: {
    /** 查询管理类名下拉树结构 */
    getDomainClassNamesTreeselect() {
      getDomainClassNamesTree().then(response => {
        this.beanNameOptions = response;
      });
    },
    /** 获取详情 */
    handleDetail(id){
      this.detailLoading = true;
      getDetail(id).then(
        response => {
          this.detailData={
            jsonObject:string2Json(response.paras)
          };
          this.detailTitle = "操作编号:"+response.id+',操作时间:'+response.occurEndTime;
          this.detailLoading = false;
        }
      );

    },
    /** 获取列表 */
    getList() {
      this.loading = true;
      let qp = this.addDateRange(this.queryParams, this.dateRange);
      let acQueryParams = deepClone(qp);
      if(acQueryParams.functionTypes!=null){
        acQueryParams.functionTypes = acQueryParams.functionTypes.join(',');
      }
      getFlowList(acQueryParams).then(
        response => {
          this.flowList = new Array();
          let datas = response.rows;
          const n = datas.length;
          for(let i=0;i<n;i++){
            let row = {
              id:datas[i].id,
              userId:datas[i].userId,
              userName:datas[i].userName,
              urlAddress:datas[i].urlAddress,
              method:datas[i].method,
              ipAddress:datas[i].ipAddress,
              content:datas[i].urlAddress,
              timestamp:datas[i].occurEndTime,
              type: 'primary',
              icon: 'el-icon-info'
            };
            if(datas[i].systemFunction!=null){
              row.content = datas[i].systemFunction.name;
              row.functionTypeName = datas[i].systemFunction.functionTypeName;
              switch(datas[i].systemFunction.functionType){
                case 'CREATE':
                  row.icon='el-icon-plus';
                  row.type='primary';
                  break;
                case 'EDIT':
                  row.icon='el-icon-edit';
                  row.type='warning';
                  break;
                case 'DELETE':
                  row.icon='el-icon-delete';
                  row.type='danger';
                  break;
                default:
                  row.icon='el-icon-search';
                  row.type='info';
              }
            }
            this.flowList.push(row);
          }
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
  }
};
</script>
