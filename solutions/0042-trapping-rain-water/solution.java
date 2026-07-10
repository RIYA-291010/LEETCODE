class Solution {
    public int trap(int[] height) {
        int n=height.length;
        int leftmax[]=new int[n];
        int rightmax[]=new int[n];
        leftmax[0]=height[0];
        for(int i=1;i<height.length;i++){
            leftmax[i]=Math.max(leftmax[i-1],height[i]);
        }
        rightmax[n-1]=height[n-1];
        for(int i=n-2;i>=0;i--){
            rightmax[i]=Math.max(rightmax[i+1],height[i]);
        }
        int tw=0;
        for(int i=0;i<n;i++){
            int wl=Math.min(leftmax[i],rightmax[i]);
            tw+=wl-height[i];
        }
        return tw;
        
    }
}
