<template>
  <div class="app-container">
    <el-input v-model="addressKeyword" placeholder="请输入地址来直接查找相关位置"></el-input>
    <baidu-map class="bmView" ak="M34ic6nt1BNTfxK0wEiZnPWzEt6Xfgqe" :scroll-wheel-zoom="true" :center="centerLocation"
      @click="getLocationPoint" :zoom="15">
      <bm-city-list anchor="BMAP_ANCHOR_TOP_LEFT"></bm-city-list>
      <bm-view style="width: 100%; height:450px; flex: 1"></bm-view>
      <bm-marker :position="currentLocation" :dragging="true" animation="BMAP_ANIMATION_BOUNCE">
        <bm-label :content="currentName" :labelStyle="{color: 'red', fontSize : '24px'}"
          :offset="{width: -35, height: 30}" />
      </bm-marker>
      <bm-local-search :keyword="addressKeyword" :auto-viewport="true" style="display: none"></bm-local-search>
    </baidu-map>
    <el-row>
      <el-col :span="11">
        <el-input v-model="address" />
      </el-col>
      <el-col :span="11">
        <el-input v-model="geoPoint" />
      </el-col>
      <el-col :span="2">
        <el-button type="success" icon="el-icon-check" size="mini" @click="confirmLocationPoint">确定</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {BaiduMap,BmNavigation,BmView,BmCityList,BmMarker,BmLabel} from 'vue-baidu-map'
  import BmLocalSearch from 'vue-baidu-map/components/search/LocalSearch.vue'

  export default {
    name: "LocationSelect",
    components: {
      BaiduMap,
      BmView,
      BmCityList,
      BmLocalSearch,
      BmMarker,
      BmLabel
    },
    props: {
      //父层带过来的信息值
      locationData: {
        name: undefined,
        location: undefined
      },
    },
    data() {
      return {
        addressKeyword:undefined,
        //中心位置
        centerLocation:'杭州',
        //当前位置
        currentLocation:'杭州',
        currentName:'',
        address:undefined,
        geoPoint:undefined
      };
    },
    created() {
      this.handleReceiveData(this.locationData);
    },
    //监听父层带过来的账户信息值
    watch: {
      locationData(newVal, oldVal) {
        this.handleReceiveData(newVal);
      }
    },
    methods: {
      /** 处理父类发起的数据 */
      handleReceiveData(data) {
        this.address=undefined;
        this.geoPoint=undefined;
        this.addressKeyword = data.name;
        if(data.location==null){
          this.centerLocation=data.name;
        }else{
          let geo = data.location.split('');
          this.centerLocation={lng: geo[0], lat: geo[1]};
          this.currentLocation={lng: geo[0], lat: geo[1]};
          this.geoPoint =data.location;
        }
        this.currentName = '当前位置：'+data.name;
      },
      /** 获取坐标 */
      getLocationPoint(e){
        let lng = e.point.lng;
        let lat = e.point.lat;
        this.geoPoint = lng+','+lat;
        //用所定位的经纬度查找所在地省市街道等信息
        let point = new BMap.Point(e.point.lng, e.point.lat);
        let gc = new BMap.Geocoder();
        let _this = this;
        gc.getLocation(point, function (rs) {
            let addComp = rs.addressComponents;
            //地址信息
            _this.address = rs.address;
        });
      },
      /** 确认坐标 */
      confirmLocationPoint(){
        const locationInfo={
          location:this.geoPoint
        }
        //调用父组件的方法
        this.$emit('confirmLocation',locationInfo);
        //调用父组件的方法来关闭子组件
        this.$emit('closeLocation');
      }
    }
  };
</script>
