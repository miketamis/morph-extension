import qj.util.ReflectUtil;
import qj.util.lang.DynamicClassLoader;
import java.lang.reflect.Method;
import java.lang.reflect.Field;

public class ClassLoader {

    Object object;
    static Class<?> clazz;

    public static void load(String classPath, String className) {
        clazz = new DynamicClassLoader(classPath).load(className);
    }

    public static String getMethods() {
        StringBuilder sb = new StringBuilder();
        Method[] methods = clazz.getDeclaredMethods();
                    
        for (int i=0; i<methods.length; i++) {
            sb.append(methods[i].toString());
            sb.append("\n");
        }

        return sb.toString();
    }


    public ClassLoader() {
        this.object = ReflectUtil.newInstance(clazz);
    }

    public static Object callStaticMethod(String methodName) {
        return ReflectUtil.invokeStatic(methodName, clazz);
    }

    public Object callMethod(String methodName) {
        return ReflectUtil.invoke(methodName, this.object);
    }
}